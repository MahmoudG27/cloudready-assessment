import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssessments } from "../services/api";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
export default function DashboardPage() {
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function fetchAssessments() {
            try {
                const response = await getAssessments();
                if (response.success) {
                    setAssessments(response.data);
                }
                else {
                    setError(response.error || "Failed to load assessments");
                }
            }
            catch {
                setError("Failed to connect to server");
            }
            finally {
                setLoading(false);
            }
        }
        fetchAssessments();
    }, []);
    function getStatusBadge(status) {
        const styles = {
            completed: { background: "#EAF3DE", color: "#27500A" },
            generating: { background: "#E6F1FB", color: "#0C447C" },
            draft: { background: "#F1EFE8", color: "#5F5E5A" },
            failed: { background: "#FCEBEB", color: "#791F1F" },
        };
        return (_jsx("span", { style: {
                ...styles[status] || styles.draft,
                padding: "3px 10px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 500
            }, children: status }));
    }
    function getScoreColor(score) {
        if (score >= 71)
            return "#639922";
        if (score >= 41)
            return "#BA7517";
        return "#E24B4A";
    }
    if (loading)
        return _jsx(LoadingSpinner, { message: "Loading assessments..." });
    return (_jsxs("div", { style: { minHeight: "100vh", background: "#f9fafb" }, children: [_jsxs("div", { style: {
                    background: "#fff",
                    borderBottom: "0.5px solid #e5e7eb",
                    padding: "12px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }, children: [_jsxs("span", { style: { fontSize: "15px", fontWeight: 500 }, children: ["Klayytech ", _jsx("span", { style: { color: "#185FA5" }, children: "CloudReady" })] }), _jsx(Button, { variant: "primary", onClick: () => navigate("/assessment"), children: "+ New assessment" })] }), _jsxs("div", { style: { padding: "24px", maxWidth: "1100px", margin: "0 auto" }, children: [_jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }, children: [
                            { label: "Total assessments", value: assessments.length, color: "#374151" },
                            {
                                label: "Advanced", color: "#27500A",
                                value: assessments.filter(a => a.insights?.level === "Advanced").length
                            },
                            {
                                label: "Developing", color: "#BA7517",
                                value: assessments.filter(a => a.insights?.level === "Developing").length
                            },
                            {
                                label: "Beginner", color: "#E24B4A",
                                value: assessments.filter(a => a.insights?.level === "Beginner").length
                            },
                        ].map((metric) => (_jsxs("div", { style: {
                                background: "#f3f4f6",
                                borderRadius: "8px",
                                padding: "14px 16px"
                            }, children: [_jsx("div", { style: { fontSize: "11px", color: "#6b7280", marginBottom: "6px" }, children: metric.label }), _jsx("div", { style: { fontSize: "22px", fontWeight: 500, color: metric.color }, children: metric.value })] }, metric.label))) }), _jsxs(Card, { children: [_jsx("div", { style: { fontSize: "14px", fontWeight: 500, marginBottom: "16px" }, children: "Recent assessments" }), error && (_jsx("div", { style: { padding: "12px", background: "#FCEBEB", color: "#791F1F", borderRadius: "8px", marginBottom: "12px", fontSize: "13px" }, children: error })), assessments.length === 0 && !error ? (_jsxs("div", { style: { textAlign: "center", padding: "48px", color: "#6b7280" }, children: [_jsx("div", { style: { fontSize: "16px", fontWeight: 500, marginBottom: "8px" }, children: "No assessments yet" }), _jsx("div", { style: { fontSize: "13px", marginBottom: "20px" }, children: "Start your first cloud readiness evaluation" }), _jsx(Button, { variant: "primary", onClick: () => navigate("/assessment"), children: "Start assessment" })] })) : (_jsxs("div", { children: [_jsx("div", { style: {
                                            display: "grid",
                                            gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr",
                                            padding: "8px 12px",
                                            background: "#f9fafb",
                                            borderRadius: "8px",
                                            marginBottom: "4px"
                                        }, children: ["Company", "Industry", "Score", "Level", "Actions"].map(h => (_jsx("span", { style: { fontSize: "11px", color: "#6b7280", fontWeight: 500 }, children: h }, h))) }), assessments.map((assessment) => {
                                        const score = assessment.report?.data?.readinessScore?.total ?? 0;
                                        return (_jsxs("div", { style: {
                                                display: "grid",
                                                gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr",
                                                padding: "12px",
                                                borderBottom: "0.5px solid #e5e7eb",
                                                alignItems: "center"
                                            }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: "13px", fontWeight: 500 }, children: assessment.companyName }), _jsx("div", { style: { fontSize: "11px", color: "#6b7280" }, children: new Date(assessment.createdAt).toLocaleDateString() })] }), _jsx("span", { style: { fontSize: "13px", color: "#6b7280" }, children: assessment.report?.data?.companyOverview?.industry ?? "—" }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [_jsx("div", { style: { flex: 1, height: "6px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }, children: _jsx("div", { style: { width: `${score}%`, height: "100%", background: getScoreColor(score), borderRadius: "3px" } }) }), _jsx("span", { style: { fontSize: "12px", minWidth: "24px" }, children: score })] }), _jsx("span", { children: getStatusBadge(assessment.status ?? "draft") }), _jsx("div", { style: { display: "flex", gap: "6px" }, children: _jsx(Button, { onClick: () => navigate(`/report/${assessment.id}`), disabled: assessment.status !== "completed", children: "View" }) })] }, assessment.id));
                                    })] }))] })] })] }));
}
