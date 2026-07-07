function SettingsPage() {
  return (
    <section className="card">

      <h2>System Settings</h2>

      <table style={{ width: "100%", marginTop: "20px" }}>
        <tbody>

          <tr>
            <td><strong>Backend URL</strong></td>
            <td>https://autonomous-product-intelligence-system.onrender.comautonomous-product-intelligence-system.onrender.comhttps://autonomous-product-intelligence-system.onrender.com</td>
          </tr>

          <tr>
            <td><strong>Database</strong></td>
            <td>SQLite</td>
          </tr>

          <tr>
            <td><strong>Embedding Model</strong></td>
            <td>Sentence Transformers</td>
          </tr>

          <tr>
            <td><strong>Search</strong></td>
            <td>Hybrid (BM25 + Vector Search)</td>
          </tr>

          <tr>
            <td><strong>LLM</strong></td>
            <td>Grounded RAG</td>
          </tr>

          <tr>
            <td><strong>Status</strong></td>
            <td style={{ color: "green" }}>✓ Connected</td>
          </tr>

        </tbody>
      </table>

    </section>
  );
}

export default SettingsPage;