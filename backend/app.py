from pathlib import Path
import shutil

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

try:
    from knowledge import ingest_document_file, list_documents
    from rag import answer_question
except ImportError:  # pragma: no cover - supports package-style imports
    from .knowledge import ingest_document_file, list_documents
    from .rag import answer_question

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"

app = FastAPI(title="Product Intelligence AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins = [
    "https://autonomous-product-intelligence-system-zeh3zw314.vercel.app",
    "https://autonomous-product-intelligence-system-fa053sual.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "message": "Product Intelligence AI API is running."}


@app.post("/upload")
async def upload_document(file: UploadFile = File(...), category: str = Form(...)):
    UPLOAD_DIR.mkdir(exist_ok=True)
    file_path = UPLOAD_DIR / file.filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = ingest_document_file(file_path, file.filename, category)
    return JSONResponse(content={"status": "indexed", **result})


@app.get("/documents")
def get_documents():
    return list_documents()


@app.get("/api/documents")
def get_documents_api():
    return list_documents()


@app.post("/ask")
def ask_question(question: str = Form(...), category: str | None = Form(None), uploaded_after: str | None = Form(None), top_k: int = Form(5)):
    filters = {}
    if category:
        filters["category"] = category
    if uploaded_after:
        filters["uploaded_after"] = uploaded_after
    return answer_question(question, filters=filters or None, top_k=top_k)


@app.post("/api/ask")
def ask_question_api(question: str = Form(...), category: str | None = Form(None), uploaded_after: str | None = Form(None), top_k: int = Form(5)):
    return ask_question(question=question, category=category, uploaded_after=uploaded_after, top_k=top_k)


@app.post("/api/chat")
def chat_api(question: str = Form(...), category: str | None = Form(None), uploaded_after: str | None = Form(None), top_k: int = Form(5)):
    return ask_question(question=question, category=category, uploaded_after=uploaded_after, top_k=top_k)
