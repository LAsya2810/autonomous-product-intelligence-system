function ReportsPage() {
  return (
    <section className="card">
      <h2>AI Reports</h2>

      <div className="dashboard-grid">

        <div className="summary-card">
          <h3>Knowledge Base</h3>
          <p>All uploaded documents successfully indexed.</p>
        </div>

        <div className="summary-card">
          <h3>AI Analyst</h3>
          <p>Grounded RAG responses enabled.</p>
        </div>

        <div className="summary-card">
          <h3>System Status</h3>
          <p>Backend Connected</p>
        </div>

        <div className="summary-card">
          <h3>Export Report</h3>
          <button disabled>
            Coming Soon
          </button>
        </div>

      </div>
    </section>
  );
}

export default ReportsPage;