import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
function ProtectedLayout({ children }) {
    return (_jsx(MsalAuthenticationTemplate, { interactionType: InteractionType.Redirect, authenticationRequest: loginRequest, children: children }));
}
function App() {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/a/:token", element: _jsx(ClientPortalPage, {}) }), _jsx(Route, { path: "/", element: _jsx(ProtectedLayout, { children: _jsx(Navigate, { to: "/dashboard", replace: true }) }) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedLayout, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/assessment", element: _jsx(ProtectedLayout, { children: _jsx(AssessmentPage, {}) }) }), _jsx(Route, { path: "/summary/:id", element: _jsx(ProtectedLayout, { children: _jsx(SummaryPage, {}) }) }), _jsx(Route, { path: "/report/:id", element: _jsx(ProtectedLayout, { children: _jsx(ReportPage, {}) }) }), _jsx(Route, { path: "/invitations", element: _jsx(ProtectedLayout, { children: _jsx(InvitationsPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] }) }));
}
export default App;
