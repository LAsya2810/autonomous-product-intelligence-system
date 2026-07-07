import json
import re
import math
from collections import Counter
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

try:
    from knowledge import CATEGORIES, get_connection, generate_embedding
except ImportError:  # pragma: no cover - supports package-style imports
    from .knowledge import CATEGORIES, get_connection, generate_embedding


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip().lower()


def _tokenize(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z0-9]+", _normalize(text))


def _bm25_scores(query: str, documents: List[Dict[str, Any]]) -> Dict[str, float]:
    query_terms = _tokenize(query)
    if not query_terms:
        return {item["id"]: 0.0 for item in documents}

    doc_freq = Counter(term for doc in documents for term in set(_tokenize(doc["text"])))
    scores: Dict[str, float] = {}
    for doc in documents:
        terms = _tokenize(doc["text"])
        tf = Counter(terms)
        doc_len = max(len(terms), 1)
        score = 0.0
        for term in query_terms:
            if term not in tf:
                continue
            df = doc_freq.get(term, 0)
            idf = math.log((1 + len(documents)) / (1 + df)) + 1.0
            score += idf * (tf[term] * (1.2 + 1.0)) / (tf[term] + 0.5 + 1.5 * (doc_len / max(1, sum(len(_tokenize(item["text"])) for item in documents) / len(documents))))
        scores[doc["id"]] = score
    return scores


def _apply_filters(filters: Optional[Dict[str, Any]], rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if not filters:
        return rows

    filtered: List[Dict[str, Any]] = []
    for row in rows:
        include = True
        for key, value in filters.items():
            if key == "category" and row.get("category") != value:
                include = False
                break
            if key == "source_type" and row.get("source_type") != value:
                include = False
                break
            if key == "filename" and row.get("filename") != value:
                include = False
                break
            if key == "uploaded_after" and row.get("uploaded_at"):
                try:
                    uploaded_at = datetime.fromisoformat(str(row["uploaded_at"]).replace("Z", "+00:00"))
                    if uploaded_at < datetime.fromisoformat(value.replace("Z", "+00:00")):
                        include = False
                except ValueError:
                    include = False
                if not include:
                    break
        if include:
            filtered.append(row)
    return filtered


def retrieve(query: str, filters: Optional[Dict[str, Any]] = None, top_k: int = 10) -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT dc.id, dc.document_id, dc.chunk_index, dc.content, d.filename, d.category, d.source_type, d.uploaded_at FROM document_chunks dc JOIN documents d ON d.id = dc.document_id ORDER BY dc.chunk_index"
    ).fetchall()

    candidate_rows: List[Dict[str, Any]] = []
    for row in rows:
        candidate_rows.append(
            {
                "id": row["id"],
                "document_id": row["document_id"],
                "chunk_index": row["chunk_index"],
                "text": row["content"],
                "filename": row["filename"],
                "category": row["category"],
                "source_type": row["source_type"],
                "uploaded_at": row["uploaded_at"],
            }
        )

    filtered_rows = _apply_filters(filters, candidate_rows)
    if not filtered_rows:
        return []

    query_embedding = generate_embedding(query)
    query_array = np.asarray(query_embedding, dtype=float)
    dense_scores: Dict[str, float] = {}
    for row in filtered_rows:
        embedding_row = conn.execute(
            "SELECT embedding FROM chunk_embeddings WHERE document_id = ? AND chunk_index = ?",
            (row["document_id"], row["chunk_index"]),
        ).fetchone()
        if not embedding_row:
            continue
        vector = np.asarray(json.loads(embedding_row["embedding"]), dtype=float)
        dense_scores[row["id"]] = float(np.dot(query_array, vector))

    bm25_scores = _bm25_scores(query, filtered_rows)

    combined: List[Tuple[str, float]] = []
    for row in filtered_rows:
        dense = dense_scores.get(row["id"], 0.0)
        bm25 = bm25_scores.get(row["id"], 0.0)
        combined_score = (dense * 0.7) + (bm25 * 0.3)
        combined.append((row["id"], combined_score))

    combined.sort(key=lambda item: item[1], reverse=True)
    ranked_ids = [item[0] for item in combined[: top_k * 3]]

    ranked_rows = [row for row in filtered_rows if row["id"] in ranked_ids]
    ranked_rows.sort(key=lambda row: ranked_ids.index(row["id"]))

    reranked: List[Dict[str, Any]] = []
    for row in ranked_rows:
        dense = dense_scores.get(row["id"], 0.0)
        bm25 = bm25_scores.get(row["id"], 0.0)
        score = (dense * 0.7) + (bm25 * 0.3)
        reranked.append(
            {
                "text": row["text"],
                "source": f"{row['filename']} :: {row['category']}",
                "score": round(float(score), 4),
                "metadata": {
                    "filename": row["filename"],
                    "category": row["category"],
                    "source_type": row["source_type"],
                    "uploaded_at": row["uploaded_at"],
                },
            }
        )

    reranked.sort(key=lambda item: item["score"], reverse=True)
    conn.close()
    return reranked[:top_k]


def answer_question(query: str, filters: Optional[Dict[str, Any]] = None, top_k: int = 5) -> Dict[str, Any]:
    hits = retrieve(query, filters=filters, top_k=top_k)

    if not hits:
        return {
            "answer": "I couldn't find any relevant information in the indexed knowledge base for that question.",
            "confidence": 0.1,
            "citations": [],
        }

    context_blocks = []
    for index, hit in enumerate(hits, start=1):
        context_blocks.append(
            f"[{index}] Source: {hit['source']}\n{hit['text']}"
        )

    prompt = (
        "You are a strictly grounded assistant. "
        "Use ONLY the provided context to answer the user's question. "
        "If the context does not contain enough information, say so. "
        "Do not use outside knowledge.\n\n"
        f"Question: {query}\n\n"
        "Context:\n"
        + "\n\n".join(context_blocks)
    )

    try:
        from openai import OpenAI
    except ImportError:
        OpenAI = None

    # ---------- FALLBACK (No OpenAI API) ----------
    if OpenAI is None:

        best_text = hits[0]["text"]

        sentences = re.split(r"(?<=[.!?])\s+", best_text)

        cleaned = []

        for sentence in sentences:
            sentence = sentence.strip()

            if len(sentence) < 20:
                continue

            if sentence in cleaned:
                continue

            cleaned.append(sentence)

            if len(cleaned) == 5:
                break

        answer = " ".join(cleaned)

        if len(answer) > 700:
            answer = answer[:700] + "..."

        confidence = 0.75

        citations = [
            {
                "source": hit["source"],
                "snippet": hit["text"][:180]
            }
            for hit in hits[:3]
        ]

        return {
            "answer": answer,
            "confidence": round(confidence, 2),
            "citations": citations,
        }

    # ---------- USING OPENAI ----------
    else:
        client = OpenAI(api_key="")

        completion = client.responses.create(
            model="gpt-4.1-mini",
            input=prompt,
            temperature=0.0,
        )

        answer = completion.output_text.strip()

        confidence = (
            0.85
            if "couldn't find" not in answer.lower()
            else 0.2
        )

        citations = [
            {
                "source": hit["source"],
                "snippet": hit["text"][:180]
            }
            for hit in hits
        ]

        return {
            "answer": answer,
            "confidence": round(confidence, 2),
            "citations": citations,
        }