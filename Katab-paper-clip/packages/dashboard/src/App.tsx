import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { ScenariosPage } from "./pages/Scenarios.js";
import { ExecutionsPage } from "./pages/Executions.js";
import { ReportsPage } from "./pages/Reports.js";
import { SettingsPage } from "./pages/Settings.js";
import { GeneratePage } from "./pages/Generate.js";

export function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <nav style={{ width: 220, padding: 20, borderRight: "1px solid #e5e7eb", background: "#fafafa" }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 700 }}>Katab</h2>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            <li><NavLink to="/scenarios">Scenarios</NavLink></li>
            <li><NavLink to="/generate">AI Generate</NavLink></li>
            <li><NavLink to="/executions">Executions</NavLink></li>
            <li><NavLink to="/reports">Reports</NavLink></li>
            <li><NavLink to="/settings">Settings</NavLink></li>
          </ul>
        </nav>
        <main style={{ flex: 1, padding: 24 }}>
          <Routes>
            <Route path="/" element={<ScenariosPage />} />
            <Route path="/scenarios" element={<ScenariosPage />} />
            <Route path="/generate" element={<GeneratePage />} />
            <Route path="/executions" element={<ExecutionsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
