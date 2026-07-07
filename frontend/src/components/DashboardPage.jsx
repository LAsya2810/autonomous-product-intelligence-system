import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Database,
  FolderOpen,
  Brain,
  CheckCircle,
} from "lucide-react";

function DashboardPage() {
  const backendUrl = useMemo(
    () => import.meta.env.VITE_BACKEND_URL || "https://autonomous-product-intelligence-system.onrender.comautonomous-product-intelligence-system.onrender.comhttps://autonomous-product-intelligence-system.onrender.com",
    []
  );

  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/documents`)
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data.documents || []);
      })
      .catch(() => {
        setDocuments([]);
      });
  }, [backendUrl]);

  const totalDocuments = documents.length;

  const totalChunks = documents.reduce(
    (sum, doc) => sum + (doc.chunk_count || 0),
    0
  );

  const categoryCounts = {};

  documents.forEach((doc) => {
    categoryCounts[doc.category] =
      (categoryCounts[doc.category] || 0) + 1;
  });

  return (
    <section className="dashboard-page">

      <div className="page-heading">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Product Intelligence AI Dashboard</h2>
          <p>
            AI-powered platform for analyzing documents, retrieving knowledge,
            generating insights, and supporting product decisions.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">

        <div className="summary-card">
          <FileText size={36} />
          <h3>Total Documents</h3>
          <h1>{totalDocuments}</h1>
        </div>

        <div className="summary-card">
          <Database size={36} />
          <h3>Total Chunks</h3>
          <h1>{totalChunks}</h1>
        </div>

        <div className="summary-card">
          <FolderOpen size={36} />
          <h3>Categories</h3>
          <h1>{Object.keys(categoryCounts).length}</h1>
        </div>

        <div className="summary-card">
          <Brain size={36} />
          <h3>AI Status</h3>
          <h1 style={{ color: "#22c55e" }}>Ready</h1>
        </div>

      </div>

      <div className="card" style={{ marginTop: "30px" }}>
        <h3>Recent Documents</h3>

        {documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          <table style={{ width: "100%", marginTop: "15px" }}>
            <thead>
              <tr>
                <th align="left">Filename</th>
                <th align="left">Category</th>
                <th align="left">Chunks</th>
              </tr>
            </thead>

            <tbody>
              {documents.slice(0, 5).map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.filename}</td>
                  <td>{doc.category}</td>
                  <td>{doc.chunk_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginTop: "30px" }}>
        <h3>Category Distribution</h3>

        {Object.keys(categoryCounts).length === 0 ? (
          <p>No categories available.</p>
        ) : (
          Object.keys(categoryCounts).map((category) => (
            <div
              key={category}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
                padding: "8px 0",
                borderBottom: "1px solid #2d3748",
              }}
            >
              <span>{category}</span>
              <strong>{categoryCounts[category]}</strong>
            </div>
          ))
        )}
      </div>

      <div className="card" style={{ marginTop: "30px" }}>
        <h3>System Capabilities</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          <div><CheckCircle color="#22c55e" size={18} /> Hybrid RAG Retrieval</div>
          <div><CheckCircle color="#22c55e" size={18} /> Semantic Search</div>
          <div><CheckCircle color="#22c55e" size={18} /> BM25 Ranking</div>
          <div><CheckCircle color="#22c55e" size={18} /> AI Analyst</div>
          <div><CheckCircle color="#22c55e" size={18} /> Deep Research</div>
          <div><CheckCircle color="#22c55e" size={18} /> Analytics Dashboard</div>
          <div><CheckCircle color="#22c55e" size={18} /> Executive Reports</div>
          <div><CheckCircle color="#22c55e" size={18} /> Explainable AI (Citations)</div>
        </div>
      </div>

    </section>
  );
}

export default DashboardPage;