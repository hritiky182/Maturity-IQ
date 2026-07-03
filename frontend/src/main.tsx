import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./components/root-layout";

// Route Page imports
import LoginPage from "./routes/login";
import Dashboard from "./routes/index";
import AssessmentsPage from "./routes/assessments";
import WizardPage from "./routes/assessments.new";
import DepartmentsPage from "./routes/departments";
import GapAnalysisPage from "./routes/gap-analysis";
import RecommendationsPage from "./routes/recommendations";
import RoadmapPage from "./routes/roadmap";
import ReportsPage from "./routes/reports";
import OrganizationPage from "./routes/organization";
import SettingsPage from "./routes/settings";

import "./styles.css";

// Initialize theme from storage
if (localStorage.getItem("theme") === null) {
  localStorage.setItem("theme", "light");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* App Shell with Sidebar */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="/assessments/new" element={<WizardPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/gap-analysis" element={<GapAnalysisPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/organization" element={<OrganizationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Fallback to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
