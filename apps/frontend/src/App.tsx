import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MsalAuthenticationTemplate } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";
import { loginRequest } from "./auth/msalConfig";
import DashboardPage from "./pages/DashboardPage";
import AssessmentPage from "./pages/AssessmentPage";
import SummaryPage from "./pages/SummaryPage";
import ReportPage from "./pages/ReportPage";
import InvitationsPage from "./pages/InvitationsPage";
import ClientPortalPage from "./pages/ClientPortalPage";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <MsalAuthenticationTemplate
      interactionType={InteractionType.Redirect}
      authenticationRequest={loginRequest}
    >
      {children}
    </MsalAuthenticationTemplate>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route — client portal */}
        <Route path="/a/:token" element={<ClientPortalPage />} />

        {/* Protected routes — admin only */}
        <Route path="/" element={
          <ProtectedLayout>
            <Navigate to="/dashboard" replace />
          </ProtectedLayout>
        } />
        <Route path="/dashboard" element={
          <ProtectedLayout>
            <DashboardPage />
          </ProtectedLayout>
        } />
        <Route path="/assessment" element={
          <ProtectedLayout>
            <AssessmentPage />
          </ProtectedLayout>
        } />
        <Route path="/summary/:id" element={
          <ProtectedLayout>
            <SummaryPage />
          </ProtectedLayout>
        } />
        <Route path="/report/:id" element={
          <ProtectedLayout>
            <ReportPage />
          </ProtectedLayout>
        } />
        <Route path="/invitations" element={
          <ProtectedLayout>
            <InvitationsPage />
          </ProtectedLayout>
        } />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;