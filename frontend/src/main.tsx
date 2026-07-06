import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./components/root-layout";

// Route Page imports
import LoginPage from "./routes/login";
import RegisterPage from "./routes/register";
import ForgotPasswordPage from "./routes/forgot-password";
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

// Admin route pages
import AdminDashboard from "./routes/admin.dashboard";
import AdminOrganizations from "./routes/admin.organizations";
import AdminAssessments from "./routes/admin.assessments";
import AdminReports from "./routes/admin.reports";
import AdminAnalytics from "./routes/admin.analytics";
import AdminSettings from "./routes/admin.settings";

import "./styles.css";

// Initialize theme from storage
if (localStorage.getItem("theme") === null) {
  localStorage.setItem("theme", "dark");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Unified Layout with guards */}
        <Route element={<RootLayout />}>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Organization User routes */}
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

          {/* Admin console routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/organizations" element={<AdminOrganizations />} />
          <Route path="/admin/assessments" element={<AdminAssessments />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
