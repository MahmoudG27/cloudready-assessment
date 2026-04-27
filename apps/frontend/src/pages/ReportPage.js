import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getReport, generatePDF, getPdfUrl, sendReport } from "../services/api";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
export default function ReportPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeSection, setActiveSection] = useState("s-hero");
    const sections = [
        { id: "s-hero", label: "Decision" },
        { id: "s-overview", label: "Overview" },
        { id: "s-score", label: "Score" },
        { id: "s-findings", label: "Findings" },
        { id: "s-risks", label: "Risks" },
        { id: "s-services", label: "Services" },
        { id: "s-arch", label: "Architecture" },
        { id: "s-roadmap", label: "Roadmap" },
        { id: "s-cost", label: "Cost & ROI" },
        { id: "s-next", label: "Next steps" },
    ];
    useEffect(() => {
        async function fetchReport() {
            if (!id)
                return;
            try {
                const response = await getReport(id);
                if (response.success && response.data) {
                    setReport(response.data);
                }
            }
            finally {
                setLoading(false);
            }
        }
        fetchReport();
    }, [id]);
    useEffect(() => {
        function handleScroll() {
            const content = document.getElementById("report-content");
            if (!content)
                return;
            let current = sections[0].id;
            sections.forEach(({ id: secId }) => {
                const el = document.getElementById(secId);
                if (!el)
                    return;
                const rect = el.getBoundingClientRect();
                if (rect.top < 120)
                    current = secId;
            });
            setActiveSection(current);
        }
        const content = document.getElementById("report-content");
        content?.addEventListener("scroll", handleScroll);
        return () => content?.removeEventListener("scroll", handleScroll);
    }, []);
    function scrollTo(secId) {
        const el = document.getElementById(secId);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    async function handleDownloadPDF() {
        if (!id)
            return;
        setPdfLoading(true);
        try {
            if (!report?.pdfUrl)
                await generatePDF(id);
            const urlResponse = await getPdfUrl(id);
            if (urlResponse.success && urlResponse.data) {
                window.open(urlResponse.data.sasUrl, "_blank");
            }
        }
        catch {
            setMessage({ type: "error", text: "Failed to generate PDF" });
        }
        finally {
            setPdfLoading(false);
        }
    }
    async function handleSendEmail() {
        if (!id || !email)
            return;
        setEmailLoading(true);
        try {
            const response = await sendReport(id, email);
            if (response.success) {
                setMessage({ type: "success", text: `Report sent to ${email}` });
                setShowEmailInput(false);
                setEmail("");
            }
        }
        catch {
            setMessage({ type: "error", text: "Failed to send email" });
        }
        finally {
            setEmailLoading(false);
        }
    }
    if (loading)
        return _jsx(LoadingSpinner, { message: "Loading report..." });
    if (!report?.report?.data)
        return (_jsxs("div", { style: { padding: "24px", textAlign: "center" }, children: [_jsx("div", { style: { fontSize: "16px", color: "#dc2626", marginBottom: "12px" }, children: "Report not found" }), _jsx(Button, { onClick: () => navigate("/dashboard"), children: "Back to dashboard" })] }));
    const data = report.report.data;
    const ui = report.report.ui;
    const score = data.readinessScore.total;
    function getScoreColor(s) {
        if (s >= 71)
            return "#639922";
        if (s >= 41)
            return "#BA7517";
        return "#E24B4A";
    }
    function getRiskBg(level) {
        if (level === "High")
            return { bg: "#FCEBEB", color: "#791F1F", border: "#F7C1C1", left: "#E24B4A" };
        if (level === "Medium")
            return { bg: "#FAEEDA", color: "#633806", border: "#FAC775", left: "#EF9F27" };
        return { bg: "#EAF3DE", color: "#27500A", border: "#C0DD97", left: "#639922" };
    }
    return (_jsxs("div", { style: { minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column" }, children: [_jsxs("div", { style: {
                    background: "#fff", borderBottom: "0.5px solid #e5e7eb",
                    padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexShrink: 0
                }, children: [_jsxs("span", { style: { fontSize: "15px", fontWeight: 500 }, children: ["Klayytech ", _jsx("span", { style: { color: "#185FA5" }, children: "CloudReady" })] }), _jsxs("div", { style: { display: "flex", gap: "8px", alignItems: "center" }, children: [_jsx(Button, { onClick: () => navigate("/dashboard"), children: "Dashboard" }), _jsx(Button, { onClick: () => setShowEmailInput(!showEmailInput), children: "Send email" }), _jsx(Button, { variant: "primary", onClick: handleDownloadPDF, disabled: pdfLoading, children: pdfLoading ? "Generating..." : "Download PDF" })] })] }), showEmailInput && (_jsxs("div", { style: { background: "#E6F1FB", padding: "12px 24px", display: "flex", gap: "8px", alignItems: "center" }, children: [_jsx("input", { value: email, onChange: (e) => setEmail(e.target.value), placeholder: "client@company.com", style: { padding: "8px 12px", border: "0.5px solid #d1d5db", borderRadius: "8px", fontSize: "13px", flex: 1 } }), _jsx(Button, { variant: "primary", onClick: handleSendEmail, disabled: emailLoading || !email, children: emailLoading ? "Sending..." : "Send" })] })), message && (_jsx("div", { style: {
                    padding: "10px 24px", fontSize: "13px",
                    background: message.type === "success" ? "#EAF3DE" : "#FCEBEB",
                    color: message.type === "success" ? "#27500A" : "#791F1F"
                }, children: message.text })), _jsxs("div", { style: { display: "flex", flex: 1, overflow: "hidden" }, children: [_jsxs("div", { style: {
                            width: "188px", borderRight: "0.5px solid #e5e7eb",
                            background: "#fff", padding: "12px 0", flexShrink: 0, overflowY: "auto"
                        }, children: [_jsx("div", { style: { padding: "8px 16px 4px", fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }, children: "App" }), [
                                { label: "Dashboard", action: () => navigate("/dashboard") },
                                { label: "Assessments", action: () => navigate("/dashboard") },
                                { label: "Reports", action: () => navigate("/dashboard") },
                                { label: "Settings", action: null },
                            ].map(item => (_jsx("div", { onClick: () => item.action?.(), style: {
                                    padding: "7px 16px",
                                    fontSize: "13px",
                                    color: item.label === "Assessments" ? "#185FA5" : item.action ? "#6b7280" : "#d1d5db",
                                    borderLeft: item.label === "Assessments" ? "2px solid #185FA5" : "2px solid transparent",
                                    background: item.label === "Assessments" ? "#E6F1FB" : "transparent",
                                    fontWeight: item.label === "Assessments" ? 500 : 400,
                                    cursor: item.action ? "pointer" : "default"
                                }, children: item.label }, item.label))), _jsx("div", { style: { height: "0.5px", background: "#e5e7eb", margin: "8px 0" } }), _jsx("div", { style: { padding: "8px 16px 4px", fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }, children: "This report" }), sections.map(({ id: secId, label }) => (_jsx("div", { onClick: () => scrollTo(secId), style: {
                                    padding: "5px 16px 5px 22px", fontSize: "12px",
                                    color: activeSection === secId ? "#185FA5" : "#6b7280",
                                    borderLeft: activeSection === secId ? "2px solid #185FA5" : "2px solid transparent",
                                    fontWeight: activeSection === secId ? 500 : 400,
                                    cursor: "pointer"
                                }, children: label }, secId)))] }), _jsxs("div", { id: "report-content", style: { flex: 1, padding: "20px", overflowY: "auto" }, children: [_jsxs("div", { id: "s-hero", style: {
                                    background: "#185FA5", borderRadius: "12px", padding: "20px 24px",
                                    marginBottom: "14px", color: "#fff"
                                }, children: [_jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "16px" }, children: [_jsxs("div", { style: {
                                                    width: "80px", height: "80px", borderRadius: "50%",
                                                    border: "4px solid rgba(255,255,255,0.4)",
                                                    background: "rgba(255,255,255,0.1)",
                                                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0
                                                }, children: [_jsx("span", { style: { fontSize: "26px", fontWeight: 500, color: "#fff", lineHeight: 1 }, children: score }), _jsx("span", { style: { fontSize: "10px", color: "rgba(255,255,255,0.6)" }, children: "/ 100" })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: "16px", fontWeight: 500, marginBottom: "6px", lineHeight: 1.3 }, children: ui?.hero.verdict ?? `${report.companyName} — Cloud Readiness Report` }), _jsx("div", { style: { fontSize: "13px", color: "rgba(255,255,255,0.75)", marginBottom: "10px" }, children: ui?.hero.subtext }), ui?.highlights[0] && (_jsxs("div", { style: {
                                                            display: "flex", alignItems: "center", gap: "8px",
                                                            background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.2)",
                                                            borderRadius: "8px", padding: "8px 12px", fontSize: "12px"
                                                        }, children: [_jsx("div", { style: { width: "7px", height: "7px", borderRadius: "50%", background: "#F7C1C1", flexShrink: 0 } }), ui.highlights[0]] }))] })] }), _jsxs("div", { style: { display: "flex", gap: "10px", paddingTop: "16px", borderTop: "0.5px solid rgba(255,255,255,0.2)" }, children: [_jsx("button", { onClick: () => window.open("mailto:sales@klayytech.com?subject=Migration Plan Request", "_blank"), style: {
                                                    flex: 1.2, padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
                                                    background: "#fff", color: "#185FA5", border: "none", cursor: "pointer"
                                                }, children: ui?.hero.ctaPrimary ?? "Start migration plan" }), _jsx("button", { onClick: () => window.open("mailto:sales@klayytech.com?subject=Security Gap Assessment", "_blank"), style: {
                                                    flex: 1, padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
                                                    background: "rgba(255,255,255,0.12)", color: "#fff",
                                                    border: "0.5px solid rgba(255,255,255,0.25)", cursor: "pointer"
                                                }, children: ui?.hero.ctaSecondary ?? "Fix critical security gaps" }), _jsx("button", { onClick: () => setShowEmailInput(true), style: {
                                                    flex: 1, padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
                                                    background: "rgba(255,255,255,0.12)", color: "#fff",
                                                    border: "0.5px solid rgba(255,255,255,0.25)", cursor: "pointer"
                                                }, children: "Talk to a cloud expert" })] }), _jsx("div", { style: { fontSize: "11px", color: "rgba(255,255,255,0.55)", textAlign: "center", marginTop: "8px" }, children: "A KlayyTech cloud architect will contact you within 24 hours" })] }), _jsx("div", { style: {
                                    background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px",
                                    padding: "12px 20px", marginBottom: "14px",
                                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px"
                                }, children: _jsxs("div", { children: [_jsxs("div", { style: { fontSize: "15px", fontWeight: 500 }, children: [report.companyName, " \u2014 Cloud readiness report"] }), _jsxs("div", { style: { fontSize: "11px", color: "#6b7280", marginTop: "2px" }, children: [data.companyOverview.industry, " \u00B7 ", data.companyOverview.companySize, " employees \u00B7 ", new Date(report.meta?.generatedAt ?? "").toLocaleDateString()] }), _jsx("div", { style: { display: "flex", gap: "6px", marginTop: "5px", flexWrap: "wrap" }, children: [
                                                { text: report.id, bg: "#f3f4f6", color: "#6b7280" },
                                                { text: "Azure OpenAI powered", bg: "#EEEDFE", color: "#3C3489" },
                                                { text: "Reviewed by KlayyTech", bg: "#E1F5EE", color: "#085041" },
                                                { text: data.companyOverview.industry, bg: "#E6F1FB", color: "#0C447C" },
                                            ].map((badge) => (_jsx("span", { style: {
                                                    fontSize: "10px", padding: "2px 8px", borderRadius: "20px",
                                                    background: badge.bg, color: badge.color
                                                }, children: badge.text }, badge.text))) })] }) }), _jsx(Card, { children: _jsxs("div", { id: "s-overview", style: { scrollMarginTop: "8px" }, children: [_jsx("div", { style: { fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }, children: "01 \u00B7 Company overview" }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "10px" }, children: [
                                                { label: "Industry", value: data.companyOverview.industry },
                                                { label: "Company size", value: data.companyOverview.companySize },
                                                { label: "IT maturity", value: data.companyOverview.itMaturityLevel, color: "#BA7517" },
                                            ].map((item) => (_jsxs("div", { style: { background: "#f9fafb", borderRadius: "8px", padding: "10px 12px" }, children: [_jsx("div", { style: { fontSize: "10px", color: "#6b7280", marginBottom: "3px" }, children: item.label }), _jsx("div", { style: { fontSize: "13px", fontWeight: 500, color: item.color ?? "#111827" }, children: item.value })] }, item.label))) }), _jsx("div", { style: { fontSize: "12px", color: "#6b7280", lineHeight: 1.5, padding: "10px 12px", background: "#f9fafb", borderRadius: "8px" }, children: data.companyOverview.itMaturityReason })] }) }), _jsx(Card, { children: _jsxs("div", { id: "s-score", style: { scrollMarginTop: "8px" }, children: [_jsx("div", { style: { fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }, children: "02 \u00B7 Cloud readiness score" }), _jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "14px" }, children: [_jsxs("div", { style: {
                                                        width: "96px", height: "96px", borderRadius: "50%",
                                                        border: `6px solid ${getScoreColor(score)}`,
                                                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0
                                                    }, children: [_jsx("span", { style: { fontSize: "10px", color: "#6b7280" }, children: "Your position" }), _jsx("span", { style: { fontSize: "30px", fontWeight: 500, color: getScoreColor(score), lineHeight: 1 }, children: score }), _jsx("span", { style: { fontSize: "10px", color: "#6b7280" }, children: "/ 100" })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: "11px", color: "#6b7280", marginBottom: "3px" }, children: "Current cloud readiness level" }), _jsx("span", { style: {
                                                                display: "inline-block", padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 500, marginBottom: "8px",
                                                                background: score >= 71 ? "#EAF3DE" : score >= 41 ? "#FAEEDA" : "#FCEBEB",
                                                                color: score >= 71 ? "#27500A" : score >= 41 ? "#633806" : "#791F1F",
                                                            }, children: data.readinessScore.level }), _jsx("div", { style: { fontSize: "12px", color: "#6b7280", marginBottom: "8px" }, children: data.cloudMaturityPosition }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", color: "#6b7280" }, children: [_jsx("span", { children: "AI confidence" }), _jsx("div", { style: { width: "70px", height: "4px", background: "#e5e7eb", borderRadius: "2px", overflow: "hidden" }, children: _jsx("div", { style: { width: `${report.meta?.confidenceScore ?? 82}%`, height: "100%", background: "#1D9E75", borderRadius: "2px" } }) }), _jsxs("span", { children: [report.meta?.confidenceScore ?? 82, "%"] })] })] })] }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }, children: [
                                                { label: "Infrastructure", value: data.readinessScore.breakdown.infrastructure, color: "#185FA5" },
                                                { label: "Security", value: data.readinessScore.breakdown.security, color: data.readinessScore.breakdown.security < 50 ? "#E24B4A" : "#185FA5" },
                                                { label: "Team readiness", value: data.readinessScore.breakdown.teamReadiness, color: "#639922" },
                                            ].map((item) => (_jsxs("div", { style: { background: "#f9fafb", borderRadius: "8px", padding: "10px" }, children: [_jsx("div", { style: { fontSize: "11px", color: "#6b7280", marginBottom: "5px" }, children: item.label }), _jsx("div", { style: { height: "5px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden", marginBottom: "4px" }, children: _jsx("div", { style: { width: `${item.value}%`, height: "100%", background: item.color, borderRadius: "3px" } }) }), _jsxs("div", { style: { fontSize: "13px", fontWeight: 500 }, children: [item.value, "%"] })] }, item.label))) })] }) }), _jsx(Card, { children: _jsxs("div", { id: "s-findings", style: { scrollMarginTop: "8px" }, children: [_jsx("div", { style: { fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }, children: "03 \u00B7 Key findings \u2014 facts detected" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: "7px" }, children: data.keyFindings.map((finding, i) => (_jsxs("div", { style: {
                                                    display: "flex", alignItems: "flex-start", gap: "9px",
                                                    padding: "9px 12px", borderRadius: "8px", fontSize: "12px", lineHeight: 1.5,
                                                    background: finding.type === "risk" ? "#FCEBEB" : "#EAF3DE",
                                                    color: finding.type === "risk" ? "#791F1F" : "#27500A",
                                                    border: `0.5px solid ${finding.type === "risk" ? "#F7C1C1" : "#C0DD97"}`,
                                                }, children: [_jsx("div", { style: { width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, marginTop: "5px", background: finding.type === "risk" ? "#E24B4A" : "#639922" } }), finding.text] }, i))) })] }) }), _jsx(Card, { children: _jsxs("div", { id: "s-risks", style: { scrollMarginTop: "8px" }, children: [_jsx("div", { style: { fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }, children: "04 \u00B7 Risk assessment \u2014 business impact" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: data.riskAssessment.map((risk, i) => {
                                                const c = getRiskBg(risk.level);
                                                return (_jsxs("div", { style: { padding: "11px 14px", borderRadius: "8px", borderLeft: `3px solid ${c.left}`, background: c.bg }, children: [_jsx("div", { style: { fontSize: "12px", fontWeight: 500, color: c.color, marginBottom: "2px" }, children: risk.risk }), _jsxs("div", { style: { fontSize: "11px", fontWeight: 500, color: c.color, marginBottom: "2px" }, children: ["Business impact: ", risk.businessImpact] }), _jsxs("div", { style: { fontSize: "11px", color: "#6b7280" }, children: ["Mitigation: ", risk.mitigation] })] }, i));
                                            }) }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginTop: "12px", paddingTop: "12px", borderTop: "0.5px solid #e5e7eb" }, children: [
                                                { label: "Estimated downtime risk", value: "$5K – $20K / incident", color: "#A32D2D" },
                                                { label: "Infra overhead reduction", value: "~30% after migration", color: "#27500A" },
                                                { label: "Compliance gap cost", value: "High — unquantified", color: "#A32D2D" },
                                            ].map((item) => (_jsxs("div", { style: { background: "#f9fafb", borderRadius: "8px", padding: "10px 12px" }, children: [_jsx("div", { style: { fontSize: "10px", color: "#6b7280", marginBottom: "3px" }, children: item.label }), _jsx("div", { style: { fontSize: "14px", fontWeight: 500, color: item.color }, children: item.value })] }, item.label))) })] }) }), _jsx(Card, { children: _jsxs("div", { id: "s-services", style: { scrollMarginTop: "8px" }, children: [_jsx("div", { style: { fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }, children: "05 \u00B7 Recommended Azure services" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: data.recommendedServices.map((svc, i) => (_jsxs("div", { style: {
                                                    display: "flex", alignItems: "flex-start", gap: "11px",
                                                    padding: "11px 14px", background: "#f9fafb", borderRadius: "8px",
                                                    border: "0.5px solid transparent"
                                                }, children: [_jsx("div", { style: {
                                                            width: "30px", height: "30px", borderRadius: "8px",
                                                            background: "#E6F1FB", display: "flex", alignItems: "center",
                                                            justifyContent: "center", flexShrink: 0, fontSize: "14px"
                                                        }, children: ["🌐", "🗄️", "🛡️", "💾", "🔑", "📊"][i % 6] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: "13px", fontWeight: 500, color: "#0C447C", marginBottom: "2px" }, children: svc.service }), _jsx("div", { style: { fontSize: "12px", fontWeight: 500, color: "#111827", marginBottom: "2px" }, children: svc.outcome }), _jsxs("div", { style: { fontSize: "11px", color: "#6b7280" }, children: ["Why it fits: ", svc.whyItFits] })] })] }, i))) })] }) }), _jsx(Card, { children: _jsxs("div", { id: "s-arch", style: { scrollMarginTop: "8px" }, children: [_jsx("div", { style: { fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }, children: "06 \u00B7 Architecture suggestion" }), ["App", "Data", "Security"].map((layer) => {
                                            const items = data.architectureSuggestion.filter(a => a.layer === layer);
                                            if (!items.length)
                                                return null;
                                            return (_jsxs("div", { style: { border: "0.5px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", marginBottom: "10px" }, children: [_jsxs("div", { style: { fontSize: "11px", fontWeight: 500, color: "#6b7280", padding: "6px 12px", background: "#f9fafb", borderBottom: "0.5px solid #e5e7eb", textTransform: "uppercase", letterSpacing: "0.04em" }, children: [layer, " layer"] }), _jsx("div", { style: { padding: "8px 12px", display: "flex", flexDirection: "column", gap: "6px" }, children: items.map((item, i) => (_jsxs("div", { style: { display: "flex", alignItems: "center" }, children: [_jsx("div", { style: { padding: "7px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, border: "0.5px solid #e5e7eb", background: "#f9fafb", color: "#111827", minWidth: "130px", textAlign: "center" }, children: item.component }), _jsx("div", { style: { padding: "0 10px", fontSize: "13px", color: "#6b7280" }, children: "\u2192" }), _jsx("div", { style: { padding: "7px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, border: "0.5px solid #B5D4F4", background: "#E6F1FB", color: "#0C447C", minWidth: "150px", textAlign: "center" }, children: item.azureService })] }, i))) })] }, layer));
                                        })] }) }), _jsx(Card, { children: _jsxs("div", { id: "s-roadmap", style: { scrollMarginTop: "8px" }, children: [_jsx("div", { style: { fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }, children: "07 \u00B7 Migration roadmap" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: "10px" }, children: data.migrationRoadmap.map((phase, i) => (_jsxs("div", { style: { padding: "12px 14px", borderRadius: "8px", borderLeft: "3px solid #185FA5", background: "#f9fafb" }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "7px" }, children: [_jsxs("span", { style: { fontSize: "12px", fontWeight: 500, color: "#111827" }, children: ["Phase ", phase.phase, ": ", phase.title] }), _jsx("span", { style: { fontSize: "10px", color: "#6b7280", background: "#fff", border: "0.5px solid #e5e7eb", padding: "2px 8px", borderRadius: "20px" }, children: phase.estimatedDuration })] }), phase.activities.map((act, j) => (_jsxs("div", { style: { fontSize: "11px", color: "#6b7280", paddingLeft: "12px", marginBottom: "3px", position: "relative" }, children: [_jsx("span", { style: { position: "absolute", left: 0, top: "6px", width: "4px", height: "4px", borderRadius: "50%", background: "#d1d5db", display: "block" } }), act] }, j)))] }, i))) }), _jsxs("div", { style: { marginTop: "8px", padding: "8px 14px", background: "#f9fafb", borderRadius: "8px", fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [_jsx("span", { children: "Estimated total migration timeline" }), _jsx("span", { style: { fontWeight: 500, color: "#111827" }, children: "3\u20134 months" })] })] }) }), _jsx(Card, { children: _jsxs("div", { id: "s-cost", style: { scrollMarginTop: "8px" }, children: [_jsx("div", { style: { fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }, children: "08 \u00B7 Estimated cost & ROI" }), _jsxs("div", { style: { marginBottom: "6px" }, children: [_jsxs("span", { style: { fontSize: "30px", fontWeight: 500, color: "#111827", lineHeight: 1 }, children: ["$", data.estimatedMonthlyCost.min, " \u2013 $", data.estimatedMonthlyCost.max] }), _jsx("span", { style: { fontSize: "14px", color: "#6b7280", marginLeft: "4px" }, children: "/ month" })] }), _jsx("div", { style: { fontSize: "12px", color: "#6b7280", lineHeight: 1.5, marginBottom: "10px" }, children: data.estimatedMonthlyCost.notes }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", paddingTop: "10px", borderTop: "0.5px solid #e5e7eb" }, children: [_jsxs("div", { style: { padding: "10px 12px", borderRadius: "8px", background: "#FCEBEB" }, children: [_jsx("div", { style: { fontSize: "10px", color: "#A32D2D", marginBottom: "3px" }, children: "Cost of NOT migrating" }), _jsx("div", { style: { fontSize: "13px", fontWeight: 500, color: "#791F1F" }, children: "$5K \u2013 $20K per incident" })] }), _jsxs("div", { style: { padding: "10px 12px", borderRadius: "8px", background: "#EAF3DE" }, children: [_jsx("div", { style: { fontSize: "10px", color: "#3B6D11", marginBottom: "3px" }, children: "Expected overhead reduction" }), _jsx("div", { style: { fontSize: "13px", fontWeight: 500, color: "#27500A" }, children: "~30% after full migration" })] })] })] }) }), _jsx(Card, { children: _jsxs("div", { id: "s-next", style: { scrollMarginTop: "8px" }, children: [_jsx("div", { style: { fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }, children: "09 \u00B7 Next steps" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: "7px" }, children: data.nextSteps.map((step, i) => (_jsxs("div", { style: {
                                                    display: "flex", alignItems: "center", gap: "10px",
                                                    padding: "10px 14px", borderRadius: "8px", fontSize: "12px",
                                                    background: i === 0 ? "#E6F1FB" : "#f9fafb",
                                                    border: i === 0 ? "0.5px solid #B5D4F4" : "none",
                                                    color: "#111827"
                                                }, children: [_jsx("div", { style: {
                                                            width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                                                            background: i === 0 ? "#185FA5" : "#fff",
                                                            border: i === 0 ? "none" : "0.5px solid #e5e7eb",
                                                            color: i === 0 ? "#fff" : "#6b7280",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            fontSize: "10px", fontWeight: 500
                                                        }, children: i + 1 }), typeof step === "string" ? step : step.step ?? JSON.stringify(step)] }, i))) })] }) }), _jsxs("div", { style: {
                                    background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px",
                                    padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "0"
                                }, children: [_jsxs("div", { style: { fontSize: "11px", color: "#6b7280", marginRight: "auto", lineHeight: 1.5 }, children: [report.id, " \u00B7 KlayyTech CloudReady \u00B7 Azure OpenAI powered", _jsx("br", {}), "Reviewed by KlayyTech Cloud Team \u00B7 Confidence: ", report.meta?.confidenceScore ?? 82, "%"] }), _jsx(Button, { onClick: () => setShowEmailInput(true), children: "Send to client" }), _jsx(Button, { variant: "primary", onClick: handleDownloadPDF, disabled: pdfLoading, children: pdfLoading ? "Generating..." : "Download PDF" })] })] })] })] }));
}
