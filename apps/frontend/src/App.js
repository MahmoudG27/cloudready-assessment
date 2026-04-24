import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import AssessmentPage from "./pages/AssessmentPage";
import SummaryPage from "./pages/SummaryPage";
import ReportPage from "./pages/ReportPage";
function App() {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "/dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/assessment", element: _jsx(AssessmentPage, {}) }), _jsx(Route, { path: "/summary/:id", element: _jsx(SummaryPage, {}) }), _jsx(Route, { path: "/report/:id", element: _jsx(ReportPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] }) }));
}
export default App;
