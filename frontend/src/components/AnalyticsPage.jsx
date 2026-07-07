import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
];

function AnalyticsPage() {
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
      });
  }, [backendUrl]);

  const categoryData = [];

  const counts = {};

  documents.forEach((doc) => {
    counts[doc.category] = (counts[doc.category] || 0) + 1;
  });

  Object.keys(counts).forEach((key) => {
    categoryData.push({
      name: key,
      value: counts[key],
    });
  });

  return (
    <section className="dashboard-page">

      <div className="page-heading">
        <div>
          <p className="eyebrow">Analytics</p>
          <h2>Knowledge Base Analytics</h2>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "25px",
        }}
      >

        <div className="card">
          <h3>Documents by Category</h3>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Knowledge Distribution</h3>

          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      <div className="card" style={{ marginTop: 30 }}>
        <h3>Indexed Documents</h3>

        <table style={{ width: "100%", marginTop: 20 }}>
          <thead>
            <tr>
              <th align="left">Filename</th>
              <th align="left">Category</th>
              <th align="left">Chunks</th>
            </tr>
          </thead>

          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.filename}</td>
                <td>{doc.category}</td>
                <td>{doc.chunk_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </section>
  );
}

export default AnalyticsPage;