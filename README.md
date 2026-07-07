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
.\.venv\Scripts\python.exe -m uvicorn app:app --host http://autonomous-product-intelligence-system.onrender.com --port 8000
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
## Overview

Autonomous Product Intelligence & Decision Support System is an AI-powered platform that uses RAG, semantic search, and LLM reasoning to analyze product documents, customer feedback, and technical reports.

The system enables intelligent document retrieval, automated insights generation, and decision support for product teams.
## Features

- PDF document upload and processing
- AI-powered question answering
- Retrieval-Augmented Generation (RAG)
- Semantic search using embeddings
- BM25 keyword retrieval
- Automated report generation
- Product insights dashboard
- Document-based reasoning
## Architecture
Documents
    ↓
Chunking
    ↓
Embeddings
    ↓
SQLite Storage
    ↓
Retriever
(BM25 + Semantic Search)
    ↓
LLM
    ↓
Answer / Report
## Tech Stack

Frontend:
- React
- Vite
- Chart.js
- jsPDF

Backend:
- FastAPI
- SQLite.

AI:
- OpenAI
- Sentence Transformers
- RAG
- BM25
