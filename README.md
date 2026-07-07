# Product Intelligence AI

## Folder structure

- frontend/ — Vite + React app with the routed dashboard experience.
- frontend/src/components/KnowledgeBasePage.jsx — upload UI and document grouping.
- backend/ — FastAPI app and ingestion pipeline.
- backend/scripts/generate_sample_documents.py — synthetic demo content generator.

## Run locally

### Backend

```powershell
cd backend
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000
```

### Frontend

```powershell
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Open http://localhost:5173/ to view the app.

### Generate sample documents

```powershell
cd backend
.\.venv\Scripts\python.exe scripts/generate_sample_documents.py
```
