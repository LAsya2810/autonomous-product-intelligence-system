import { useEffect, useMemo, useState } from "react";

const CATEGORIES = [
  "Support Tickets",
  "Meeting Notes",
  "PRDs",
  "Feature Requests",
  "Release Notes",
];

function KnowledgeBasePage() {
  const [documents, setDocuments] = useState([]);
  const [countsByCategory, setCountsByCategory] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [statusItems, setStatusItems] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const backendUrl = useMemo(
    () => import.meta.env.VITE_BACKEND_URL || "https://autonomous-product-intelligence-system.onrender.comautonomous-product-intelligence-system.onrender.comhttps://autonomous-product-intelligence-system.onrender.com",
    []
  );

  const loadDocuments = async () => {
    try {
      const response = await fetch(`${backendUrl}/documents`);

      if (!response.ok) {
        throw new Error("Unable to load documents");
      }

      const payload = await response.json();

      setDocuments(payload.documents || []);
      setCountsByCategory(payload.counts_by_category || {});
    } catch (err) {
      console.error(err);
      setDocuments([]);
      setCountsByCategory({});
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFiles.length) return;

    setIsUploading(true);

    const statuses = selectedFiles.map((file) => ({
      id: `${file.name}-${file.size}`,
      name: file.name,
      category: selectedCategory,
      status: "uploading",
    }));

    setStatusItems(statuses);

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", selectedCategory);

      setStatusItems((current) =>
        current.map((item) =>
          item.name === file.name
            ? { ...item, status: "processing" }
            : item
        )
      );

      try {
        const response = await fetch(`${backendUrl}/upload`, {
          method: "POST",
          body: formData,
        });

        console.log("Upload Status:", response.status);

        const data = await response.json();

        console.log("Backend Response:", data);

        if (!response.ok) {
          throw new Error(JSON.stringify(data));
        }

        setStatusItems((current) =>
          current.map((item) =>
            item.name === file.name
              ? { ...item, status: "indexed" }
              : item
          )
        );
      } catch (error) {
        console.error("Upload Error:", error);

        setStatusItems((current) =>
          current.map((item) =>
            item.name === file.name
              ? { ...item, status: "failed" }
              : item
          )
        );
      }
    }

    await loadDocuments();

    setSelectedFiles([]);
    setIsUploading(false);
  };

  return (
    <section className="knowledge-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Knowledge Base</p>
          <h2>Upload product documents</h2>
        </div>

        <div className="summary-card">
          <strong>{documents.length}</strong>
          <span>Indexed Documents</span>
        </div>
      </div>

      <form className="upload-card" onSubmit={handleUpload}>
        <div className="upload-fields">
          <label>
            <span>Select Files</span>

            <input
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.csv"
              onChange={(e) =>
                setSelectedFiles(Array.from(e.target.files || []))
              }
            />
          </label>

          <label>
            <span>Category</span>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={isUploading || !selectedFiles.length}
        >
          {isUploading ? "Uploading..." : "Upload & Index"}
        </button>
      </form>

      <div className="status-list">
        {statusItems.map((item) => (
          <div className="status-row" key={item.id}>
            <span>{item.name}</span>

            <span className={`status-chip ${item.status}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>

      <div className="category-grid">
        {CATEGORIES.map((category) => {
          const docs = documents.filter(
            (doc) => doc.category === category
          );

          return (
            <section className="category-card" key={category}>
              <div className="category-header">
                <h3>{category}</h3>

                <span>
                  {countsByCategory[category] || docs.length} docs
                </span>
              </div>

              {docs.length ? (
                <ul>
                  {docs.map((doc) => (
                    <li key={doc.id}>
                      <strong>{doc.filename}</strong>

                      <p>
                        Indexed • {doc.chunk_count} chunks
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty">
                  No documents uploaded yet.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}

export default KnowledgeBasePage;