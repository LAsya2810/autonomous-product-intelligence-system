import csv
import hashlib
import json
import os
import re
import sqlite3
import uuid
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
from docx import Document as DocxDocument
from pypdf import PdfReader

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = BASE_DIR / "uploads"
DB_PATH = DATA_DIR / "knowledge.db"

CATEGORIES = [
    "Support Tickets",
    "Meeting Notes",
    "PRDs",
    "Feature Requests",
    "Release Notes",
]

def ensure_storage() -> None:
    DATA_DIR.mkdir(exist_ok=True)
    UPLOADS_DIR.mkdir(exist_ok=True)
    _initialize_database()


def _initialize_database() -> None:
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            category TEXT NOT NULL,
            source_type TEXT NOT NULL,
            uploaded_at TEXT NOT NULL,
            metadata TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS document_chunks (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            content TEXT NOT NULL,
            FOREIGN KEY(document_id) REFERENCES documents(id)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS chunk_embeddings (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            embedding TEXT NOT NULL,
            FOREIGN KEY(document_id) REFERENCES documents(id)
        )
        """
    )
    conn.commit()
    conn.close()


def get_connection() -> sqlite3.Connection:
    ensure_storage()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def generate_embedding(text: str, dimensions: int = 128) -> List[float]:
    tokens = re.findall(r"[a-zA-Z0-9]+", text.lower())
    vector = np.zeros(dimensions, dtype=float)
    counts = Counter(tokens)
    for token, count in counts.items():
        digest = int(hashlib.sha256(token.encode("utf-8")).hexdigest()[:8], 16)
        index = digest % dimensions
        vector[index] += count
    norm = float(np.linalg.norm(vector))
    if norm == 0:
        return vector.tolist()
    return (vector / norm).tolist()


def chunk_text(text: str) -> List[str]:
    cleaned_blocks = []
    for block in re.split(r"\n\s*\n", text):
        cleaned = re.sub(r"\s+", " ", block).strip()
        if cleaned:
            cleaned_blocks.append(cleaned)

    if not cleaned_blocks:
        return []

    chunks: List[str] = []
    current: List[str] = []
    current_length = 0

    for block in cleaned_blocks:
        is_heading = bool(re.match(r"^(#{1,6}\s|[A-Z][A-Za-z0-9/&(). -]{1,40}:|[A-Z][A-Za-z0-9/&(). -]{1,40}$)", block))

        if is_heading and current:
            chunks.append(" ".join(current).strip())
            current = []
            current_length = 0

        if current and current_length + len(block) > 900:
            chunks.append(" ".join(current).strip())
            current = []
            current_length = 0

        current.append(block)
        current_length += len(block)

    if current:
        chunks.append(" ".join(current).strip())

    return [chunk for chunk in chunks if len(chunk) >= 80]


def extract_text_from_file(file_path: str) -> str:
    suffix = Path(file_path).suffix.lower()
    if suffix == ".pdf":
        reader = PdfReader(file_path)
        return "\n\n".join(page.extract_text() or "" for page in reader.pages)
    if suffix == ".docx":
        document = DocxDocument(file_path)
        return "\n\n".join(paragraph.text for paragraph in document.paragraphs if paragraph.text)
    if suffix == ".txt":
        return Path(file_path).read_text(encoding="utf-8", errors="ignore")
    if suffix == ".csv":
        with open(file_path, "r", encoding="utf-8-sig", newline="") as handle:
            rows = list(csv.reader(handle))
        return "\n".join(" | ".join(row) for row in rows if row)
    raise ValueError(f"Unsupported file type: {suffix}")


def ingest_text_document(text: str, filename: str, category: str, source_type: str = "text", metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    ensure_storage()
    document_id = str(uuid.uuid4())
    uploaded_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    chunks = chunk_text(text) or [text[:1200]]
    embeddings = [generate_embedding(chunk) for chunk in chunks]

    conn = get_connection()
    conn.execute(
        "INSERT INTO documents (id, filename, category, source_type, uploaded_at, metadata) VALUES (?, ?, ?, ?, ?, ?)",
        (
            document_id,
            filename,
            category,
            source_type,
            uploaded_at,
            json.dumps(metadata or {}),
        ),
    )
    for index, chunk in enumerate(chunks):
        conn.execute(
            "INSERT INTO document_chunks (id, document_id, chunk_index, content) VALUES (?, ?, ?, ?)",
            (f"{document_id}-{index}", document_id, index, chunk),
        )
        conn.execute(
            "INSERT INTO chunk_embeddings (id, document_id, chunk_index, embedding) VALUES (?, ?, ?, ?)",
            (f"{document_id}-{index}-embedding", document_id, index, json.dumps(embeddings[index])),
        )
    conn.commit()
    conn.close()

    return {
        "id": document_id,
        "filename": filename,
        "category": category,
        "chunk_count": len(chunks),
        "uploaded_at": uploaded_at,
    }


def ingest_document_file(file_path: str | os.PathLike[str], filename: str, category: str) -> Dict[str, Any]:
    file_path = str(file_path)
    text = extract_text_from_file(file_path)
    return ingest_text_document(text=text, filename=filename, category=category, source_type=Path(file_path).suffix.lower().lstrip("."))


def list_documents() -> Dict[str, Any]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, filename, category, source_type, uploaded_at, metadata FROM documents ORDER BY uploaded_at DESC"
    ).fetchall()
    documents = []
    for row in rows:
        chunk_count = conn.execute(
            "SELECT COUNT(*) as count FROM document_chunks WHERE document_id = ?",
            (row["id"],),
        ).fetchone()["count"]
        documents.append(
            {
                "id": row["id"],
                "filename": row["filename"],
                "category": row["category"],
                "source_type": row["source_type"],
                "uploaded_at": row["uploaded_at"],
                "metadata": json.loads(row["metadata"]),
                "chunk_count": chunk_count,
            }
        )
    conn.close()

    counts_by_category = Counter(document["category"] for document in documents)
    return {
        "documents": documents,
        "counts_by_category": {category: counts_by_category.get(category, 0) for category in CATEGORIES},
    }
