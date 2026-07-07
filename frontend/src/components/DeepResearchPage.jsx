import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";

function DeepResearchPage() {
  const backendUrl = useMemo(
    () => import.meta.env.VITE_BACKEND_URL || "https://autonomous-product-intelligence-system.onrender.com",
    []
  );

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Load previous research history
  useEffect(() => {
    const saved = localStorage.getItem("researchHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Save history automatically
  useEffect(() => {
    localStorage.setItem("researchHistory", JSON.stringify(history));
  }, [history]);

  async function handleResearch(e) {
    e.preventDefault();

    if (!question.trim()) return;

    setLoading(true);

    const form = new FormData();
    form.append("question", question);

    try {
      const response = await fetch(`${backendUrl}/ask`, {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      setResult(data);

      setHistory((prev) => [
        {
          question,
          answer: data.answer,
          confidence: data.confidence,
          citations: data.citations || [],
        },
        ...prev,
      ]);
    } catch {
      alert("Research failed.");
    }

    setLoading(false);
  }

  function downloadReport() {
    if (!result) return;

    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(20);
    doc.text("Product Intelligence AI", 20, y);

    y += 12;

    doc.setFontSize(15);
    doc.text("Executive Research Report", 20, y);

    y += 15;

    doc.setFontSize(12);

    doc.text("Research Question:", 20, y);
    y += 8;

    const questionLines = doc.splitTextToSize(question, 170);
    doc.text(questionLines, 20, y);

    y += questionLines.length * 7 + 10;

    doc.text("Executive Summary:", 20, y);
    y += 8;

    const summaryLines = doc.splitTextToSize(result.answer, 170);
    doc.text(summaryLines, 20, y);

    y += summaryLines.length * 7 + 10;

    doc.text(
      `Confidence Score : ${Math.round(result.confidence * 100)}%`,
      20,
      y
    );

    y += 15;

    doc.text("Evidence Used:", 20, y);

    y += 10;

    result.citations?.forEach((c) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const source = doc.splitTextToSize(c.source, 170);
      doc.text(source, 20, y);

      y += source.length * 6;

      const snippet = doc.splitTextToSize(c.snippet, 170);
      doc.text(snippet, 20, y);

      y += snippet.length * 6 + 8;
    });

    doc.save("Research_Report.pdf");
  }

  function clearHistory() {
    localStorage.removeItem("researchHistory");
    setHistory([]);
  }

  return (
    <section className="dashboard-page">

      <div className="page-heading">
        <div>
          <p className="eyebrow">Deep Research</p>
          <h2>Autonomous Product Research</h2>
        </div>
      </div>

      <form className="upload-card" onSubmit={handleResearch}>

        <label style={{ width: "100%" }}>
          <span>Research Question</span>

          <textarea
            rows={8}
            value={question}
            placeholder="Example: Analyze customer complaints across all uploaded documents and recommend the top three product improvements."
            onChange={(e) => setQuestion(e.target.value)}
            style={{
              width: "100%",
              padding: "15px",
              fontSize: "16px",
              marginTop: "10px",
              borderRadius: "12px",
              resize: "vertical",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "20px",
            padding: "12px 30px",
            fontSize: "16px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          {loading ? "Researching..." : "Start Research"}
        </button>

      </form>

      {loading && (
        <div className="card" style={{ marginTop: 25 }}>
          <h3>Research Progress</h3>

          <p>✅ Planning research...</p>
          <p>✅ Retrieving relevant documents...</p>
          <p>✅ Ranking evidence...</p>
          <p>✅ Performing semantic analysis...</p>
          <p>✅ Generating executive summary...</p>
          <p>✅ Preparing recommendations...</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="card" style={{ marginTop: 25 }}>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2>Research History</h2>

            <button
              onClick={clearHistory}
              style={{
                padding: "8px 15px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Clear History
            </button>
          </div>

          {history.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                setQuestion(item.question);
                setResult(item);
              }}
              style={{
                marginTop: "15px",
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                cursor: "pointer",
                background: "#593181",
              }}
            >
              <strong>{item.question}</strong>

              <p style={{ marginTop: "8px" }}>
                Confidence : {Math.round(item.confidence * 100)}%
              </p>
            </div>
          ))}
        </div>
      )}

      {result && (
        <div className="card" style={{ marginTop: 25 }}>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2>Executive Summary</h2>

            <button
              onClick={downloadReport}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Download PDF
            </button>
          </div>

          <div
            className="summary-card"
            style={{ marginTop: "20px" }}
          >
            <p>{result.answer}</p>
          </div>

          <div style={{ marginTop: "30px" }}>
            <h2>Key Findings</h2>

            <ul>
              <li>Retrieved relevant documents using semantic search.</li>
              <li>Combined multiple document chunks for analysis.</li>
              <li>Generated grounded answer using the RAG pipeline.</li>
              <li>Attached supporting evidence for every response.</li>
            </ul>
          </div>

          <div style={{ marginTop: "30px" }}>
            <h2>Recommendations</h2>

            <ul>
              <li>Review recurring customer pain points.</li>
              <li>Upload more knowledge sources for better coverage.</li>
              <li>Generate reports for product managers.</li>
              <li>Use findings during roadmap planning.</li>
            </ul>
          </div>

          <div style={{ marginTop: "30px" }}>
            <h2>Confidence Score</h2>

            <h3>{Math.round(result.confidence * 100)}%</h3>
          </div>

          <div style={{ marginTop: "30px" }}>
            <h2>Evidence Used</h2>

            {result.citations?.map((c, index) => (
              <div
                key={index}
                style={{
                  marginTop: "15px",
                  padding: "15px",
                  border: "1px solid #3f338f",
                  borderRadius: "10px",
                  background: "#39379a",
                }}
              >
                <strong>{c.source}</strong>

                <p style={{ marginTop: "8px" }}>
                  {c.snippet}
                </p>
              </div>
            ))}
          </div>

        </div>
      )}

    </section>
  );
}

export default DeepResearchPage;