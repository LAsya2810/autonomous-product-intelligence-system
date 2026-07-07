import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from knowledge import ingest_text_document
from rag import answer_question, retrieve


def test_retrieve_returns_relevant_chunks_for_keyword_query():
    ingest_text_document(
        text="Customer reported a billing outage after the release. Support team confirmed the issue and escalated to engineering.",
        filename="test-support-note.txt",
        category="Support Tickets",
    )

    results = retrieve("billing outage support", filters={"category": "Support Tickets"}, top_k=5)

    assert results
    assert any("billing" in result["text"].lower() for result in results)


def test_answer_question_returns_grounded_response_when_context_is_missing():
    response = answer_question("What is the capital of France?", filters={"category": "Support Tickets"}, top_k=3)

    assert response["answer"].lower().startswith("i couldn't") or "relevant information" in response["answer"].lower()
    assert response["confidence"] <= 0.35
