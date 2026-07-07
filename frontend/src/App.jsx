import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import KnowledgeBasePage from './components/KnowledgeBasePage';
import AIAnalystPage from './components/AIAnalystPage';
import DashboardPage from "./components/DashboardPage";
import AnalyticsPage from "./components/AnalyticsPage";
import ReportsPage from "./components/ReportsPage";
import SettingsPage from "./components/SettingsPage";
import DeepResearchPage from "./components/DeepResearchPage";
import {
  LayoutDashboard,
  Database,
 Bot,
  Search,
  BarChart3,
  FileText,
  Settings
} from "lucide-react";

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/knowledge-base', label: 'Knowledge Base' },
  { to: '/ai-analyst', label: 'AI Analyst' },
  { to: '/deep-research', label: 'Deep Research' },
  { to: '/reports', label: 'Reports' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' },
];

function PlaceholderPage({ title, description }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}

function App() {
  const location = useLocation();
  const [backendStatus, setBackendStatus] = useState('Checking backend...');

  const pageTitle = useMemo(() => {
    const match = navItems.find((item) => item.to === location.pathname);
    return match ? match.label : 'Dashboard';
  }, [location.pathname]);

  useEffect(() => {
    const endpoint = import.meta.env.VITE_BACKEND_URL || 'http://https://autonomous-product-intelligence-system.onrender.com/health';

    fetch(endpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Health check failed');
        }
        return response.json();
      })
      .then(() => setBackendStatus('Backend connected'))
      .catch(() => setBackendStatus('Backend unavailable'));
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">Autonomous Product Intelligence Platform</p>
          <h1>Product Intelligence AI</h1>
        </div>

        <nav className="nav-links">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Operations intelligence</p>
            <h2>{pageTitle}</h2>
          </div>
          <div className="status-pill">{backendStatus}</div>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
            <Route path="/ai-analyst" element={<AIAnalystPage />} />
            <Route path="/deep-research" element={<DeepResearchPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
