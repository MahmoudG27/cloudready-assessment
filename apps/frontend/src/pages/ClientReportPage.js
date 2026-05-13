import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { getReport } from "../services/api";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
export default function ClientReportPage({ assessmentId, token }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchReport() {
            try {
                const response = await getReport(assessmentId);
                if (response.success && response.data) {
                    setReport(response.data);
                }
            }
            finally {
                setLoading(false);
            }
        }
        fetchReport();
    }, [assessmentId]);
    if (loading)
        return _jsx(LoadingSpinner, { message: "Loading your report..." });
    if (!report?.report?.data)
        return (_jsx("div", { style: { padding: "24px", textAlign: "center", color: "#dc2626" }, children: "Report not available" }));
    const data = report.report.data;
    const score = data.readinessScore.total;
    function getScoreColor(s) {
        if (s >= 71)
            return "#639922";
        if (s >= 41)
            return "#BA7517";
        return "#E24B4A";
    }
    return (_jsxs("div", { style: { minHeight: "100vh", background: "#f9fafb" }, children: [_jsxs("div", { style: {
                    background: "#185FA5", padding: "16px 24px",
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                }, children: [_jsxs("span", { style: { color: "#fff", fontSize: "15px", fontWeight: 500 }, children: ["Klayytech ", _jsx("span", { style: { color: "#B5D4F4" }, children: "CloudReady" })] }), _jsxs("span", { style: { color: "rgba(255,255,255,0.7)", fontSize: "12px" }, children: [report.companyName, " \u2014 Cloud Readiness Report"] })] }), _jsxs("div", { style: { maxWidth: "800px", margin: "0 auto", padding: "24px" }, children: [_jsxs("div", { style: {
                            background: "#E6F1FB", border: "0.5px solid #B5D4F4",
                            borderRadius: "8px", padding: "10px 16px",
                            fontSize: "12px", color: "#0C447C", marginBottom: "20px",
                            display: "flex", alignItems: "center", gap: "8px"
                        }, children: [_jsx("span", { children: "\uD83D\uDCC4" }), "This is your personalized cloud readiness report. To discuss next steps, contact your KlayyTech representative."] }), _jsx("div", { style: {
                            background: "#185FA5", borderRadius: "12px",
                            padding: "24px", marginBottom: "16px", color: "#fff"
                        }, children: _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "20px" }, children: [_jsxs("div", { style: {
                                        width: "88px", height: "88px", borderRadius: "50%",
                                        border: "4px solid rgba(255,255,255,0.4)",
                                        background: "rgba(255,255,255,0.1)",
                                        display: "flex", flexDirection: "column",
                                        alignItems: "center", justifyContent: "center", flexShrink: 0
                                    }, children: [_jsx("span", { style: { fontSize: "28px", fontWeight: 600, lineHeight: 1 }, children: score }), _jsx("span", { style: { fontSize: "10px", opacity: 0.7 }, children: "/ 100" })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: "18px", fontWeight: 600, marginBottom: "4px" }, children: report.report.ui?.hero.verdict }), _jsx("div", { style: { fontSize: "13px", opacity: 0.8, marginBottom: "12px" }, children: report.report.ui?.hero.subtext }), _jsx("div", { style: { display: "flex", gap: "8px" }, children: _jsx("a", { href: "mailto:info@klayytech.com?subject=Cloud Migration Consultation", style: {
                                                    padding: "8px 16px",
                                                    borderRadius: "8px",
                                                    fontSize: "12px",
                                                    fontWeight: 500,
                                                    background: "#fff",
                                                    color: "#185FA5",
                                                    textDecoration: "none",
                                                    display: "inline-block"
                                                }, children: "Talk to a cloud expert" }) })] })] }) }), _jsxs(Card, { children: [_jsx("div", { style: { fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }, children: "Cloud Readiness Score" }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }, children: [
                                    { label: "Infrastructure", value: data.readinessScore.breakdown.infrastructure, color: "#185FA5" },
                                    { label: "Security", value: data.readinessScore.breakdown.security, color: data.readinessScore.breakdown.security < 50 ? "#E24B4A" : "#185FA5" },
                                    { label: "Team Readiness", value: data.readinessScore.breakdown.teamReadiness, color: "#639922" },
                                ].map((item) => (_jsxs("div", { style: { background: "#f9fafb", borderRadius: "8px", padding: "12px" }, children: [_jsx("div", { style: { fontSize: "11px", color: "#6b7280", marginBottom: "6px" }, children: item.label }), _jsx("div", { style: { height: "5px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden", marginBottom: "6px" }, children: _jsx("div", { style: { width: `${item.value}%`, height: "100%", background: item.color, borderRadius: "3px" } }) }), _jsxs("div", { style: { fontSize: "14px", fontWeight: 500 }, children: [item.value, "%"] })] }, item.label))) })] }), _jsxs(Card, { children: [_jsx("div", { style: { fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }, children: "Key Findings" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: "7px" }, children: data.keyFindings.map((finding, i) => (_jsxs("div", { style: {
                                        display: "flex", alignItems: "flex-start", gap: "9px",
                                        padding: "9px 12px", borderRadius: "8px", fontSize: "12px", lineHeight: 1.5,
                                        background: finding.type === "risk" ? "#FCEBEB" : "#EAF3DE",
                                        color: finding.type === "risk" ? "#791F1F" : "#27500A",
                                        border: `0.5px solid ${finding.type === "risk" ? "#F7C1C1" : "#C0DD97"}`,
                                    }, children: [_jsx("div", { style: {
                                                width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                                                marginTop: "5px", background: finding.type === "risk" ? "#E24B4A" : "#639922"
                                            } }), finding.text] }, i))) })] }), _jsxs(Card, { children: [_jsx("div", { style: { fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }, children: "Recommended Azure Services" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: data.recommendedServices.map((svc, i) => (_jsxs("div", { style: {
                                        display: "flex", alignItems: "flex-start", gap: "10px",
                                        padding: "10px 14px", background: "#f9fafb", borderRadius: "8px"
                                    }, children: [_jsx("div", { style: {
                                                width: "28px", height: "28px", borderRadius: "6px",
                                                background: "#E6F1FB", display: "flex", alignItems: "center",
                                                justifyContent: "center", flexShrink: 0, fontSize: "12px"
                                            }, children: "Az" }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: "13px", fontWeight: 500, color: "#0C447C" }, children: svc.service }), _jsx("div", { style: { fontSize: "11px", color: "#6b7280", marginTop: "2px" }, children: svc.outcome })] })] }, i))) })] }), _jsxs(Card, { children: [_jsx("div", { style: { fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }, children: "Estimated Monthly Cost" }), _jsxs("div", { style: { fontSize: "28px", fontWeight: 500, color: "#111827" }, children: ["$", data.estimatedMonthlyCost.min, " \u2013 $", data.estimatedMonthlyCost.max, _jsx("span", { style: { fontSize: "14px", color: "#6b7280", marginLeft: "6px" }, children: "/ month" })] }), _jsx("div", { style: { fontSize: "12px", color: "#6b7280", marginTop: "6px" }, children: data.estimatedMonthlyCost.notes })] }), _jsxs("div", { style: {
                            background: "#185FA5", borderRadius: "12px",
                            padding: "20px 24px", textAlign: "center", color: "#fff"
                        }, children: [_jsx("div", { style: { fontSize: "15px", fontWeight: 500, marginBottom: "6px" }, children: "Ready to start your cloud journey?" }), _jsx("div", { style: { fontSize: "13px", opacity: 0.8, marginBottom: "16px" }, children: "A KlayyTech cloud architect will guide you through every step." }), _jsx("div", { style: { display: "flex", gap: "8px" }, children: _jsx("a", { href: "mailto:support@klayytech.com?subject=Cloud Migration Consultation", style: {
                                        padding: "8px 16px",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                        fontWeight: 500,
                                        background: "#fff",
                                        color: "#185FA5",
                                        textDecoration: "none",
                                        display: "inline-block"
                                    }, children: "Talk to a cloud expert" }) })] }), _jsxs("div", { style: { textAlign: "center", padding: "16px", fontSize: "11px", color: "#9ca3af" }, children: [report.id, " \u00B7 KlayyTech CloudReady \u00B7 Powered by Azure OpenAI"] })] })] }));
}
