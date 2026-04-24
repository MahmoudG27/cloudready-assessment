import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAssessment } from "../hooks/useAssessment";
import { getAssessment } from "../services/api";
import { calculateScore } from "../utils/scoring";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
export default function SummaryPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { generate, pollReport, loading, error } = useAssessment();
    const [assessment, setAssessment] = useState(null);
    const [fetching, setFetching] = useState(true);
    const [generating, setGenerating] = useState(false);
    useEffect(() => {
        async function fetchAssessment() {
            if (!id)
                return;
            try {
                const response = await getAssessment(id);
                if (response.success && response.data) {
                    setAssessment(response.data);
                }
            }
            finally {
                setFetching(false);
            }
        }
        fetchAssessment();
    }, [id]);
    async function handleGenerate() {
        if (!id)
            return;
        setGenerating(true);
        const success = await generate(id);
        if (success) {
            const report = await pollReport(id);
            if (report)
                navigate(`/report/${id}`);
        }
        setGenerating(false);
    }
    if (fetching)
        return _jsx(LoadingSpinner, { message: "Loading assessment..." });
    if (!assessment)
        return _jsx("div", { style: { padding: "24px", color: "#dc2626" }, children: "Assessment not found" });
    const score = calculateScore(assessment.answers);
    function getScoreColor(total) {
        if (total >= 71)
            return "#639922";
        if (total >= 41)
            return "#BA7517";
        return "#E24B4A";
    }
    function getScoreLevel(total) {
        if (total >= 71)
            return "Advanced";
        if (total >= 41)
            return "Developing";
        return "Beginner";
    }
    const findings = [
        !assessment.answers.backupSolution || assessment.answers.backupSolution === "No"
            ? { type: "risk", text: "No backup or disaster recovery solution detected" }
            : { type: "strength", text: "Backup solution is in place" },
        assessment.answers.sensitiveData === "Yes"
            ? { type: "risk", text: "Sensitive data handled — compliance requirements apply" }
            : { type: "strength", text: "No sensitive data exposure detected" },
        assessment.answers.microsoftProducts !== "None"
            ? { type: "strength", text: "Microsoft ecosystem detected — strong Azure alignment" }
            : { type: "risk", text: "No Microsoft products in use" },
    ];
    return (_jsxs("div", { style: { minHeight: "100vh", background: "#f9fafb" }, children: [_jsxs("div", { style: {
                    background: "#fff",
                    borderBottom: "0.5px solid #e5e7eb",
                    padding: "12px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }, children: [_jsxs("span", { style: { fontSize: "15px", fontWeight: 500 }, children: ["Klayytech ", _jsx("span", { style: { color: "#185FA5" }, children: "CloudReady" })] }), _jsx("span", { style: { fontSize: "13px", color: "#6b7280" }, children: assessment.companyName })] }), _jsxs("div", { style: { padding: "24px", maxWidth: "680px", margin: "0 auto" }, children: [_jsx("div", { style: { fontSize: "18px", fontWeight: 500, marginBottom: "4px" }, children: "Assessment complete" }), _jsx("div", { style: { fontSize: "13px", color: "#6b7280", marginBottom: "20px" }, children: "Here is a quick summary before generating the full report" }), _jsxs(Card, { children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "24px", marginBottom: "16px" }, children: [_jsxs("div", { style: {
                                            width: "90px", height: "90px", borderRadius: "50%",
                                            border: `5px solid ${getScoreColor(score.total)}`,
                                            display: "flex", flexDirection: "column",
                                            alignItems: "center", justifyContent: "center", flexShrink: 0
                                        }, children: [_jsx("span", { style: { fontSize: "28px", fontWeight: 500, color: getScoreColor(score.total), lineHeight: 1 }, children: score.total }), _jsx("span", { style: { fontSize: "10px", color: "#6b7280" }, children: "/ 100" })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: "11px", color: "#6b7280", marginBottom: "3px" }, children: "Readiness level" }), _jsx("div", { style: { fontSize: "20px", fontWeight: 500, marginBottom: "6px" }, children: getScoreLevel(score.total) }), _jsx("span", { style: {
                                                    padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
                                                    background: score.total >= 71 ? "#EAF3DE" : score.total >= 41 ? "#FAEEDA" : "#FCEBEB",
                                                    color: score.total >= 71 ? "#27500A" : score.total >= 41 ? "#633806" : "#791F1F",
                                                }, children: getScoreLevel(score.total) })] })] }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }, children: [
                                    { label: "Infrastructure", value: score.infrastructure, color: "#185FA5" },
                                    { label: "Security", value: score.security, color: score.security < 50 ? "#E24B4A" : "#185FA5" },
                                    { label: "Team readiness", value: score.teamReadiness, color: "#185FA5" },
                                ].map((item) => (_jsxs("div", { style: { background: "#f9fafb", borderRadius: "8px", padding: "10px" }, children: [_jsx("div", { style: { fontSize: "11px", color: "#6b7280", marginBottom: "5px" }, children: item.label }), _jsx("div", { style: { height: "5px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden", marginBottom: "4px" }, children: _jsx("div", { style: { width: `${item.value}%`, height: "100%", background: item.color, borderRadius: "3px" } }) }), _jsxs("div", { style: { fontSize: "13px", fontWeight: 500 }, children: [item.value, "%"] })] }, item.label))) })] }), _jsxs(Card, { children: [_jsx("div", { style: { fontSize: "14px", fontWeight: 500, marginBottom: "12px" }, children: "Key highlights" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: findings.map((finding, index) => (_jsxs("div", { style: {
                                        display: "flex", alignItems: "flex-start", gap: "9px",
                                        padding: "9px 12px", borderRadius: "8px", fontSize: "12px", lineHeight: 1.5,
                                        background: finding.type === "risk" ? "#FCEBEB" : "#EAF3DE",
                                        color: finding.type === "risk" ? "#791F1F" : "#27500A",
                                        border: `0.5px solid ${finding.type === "risk" ? "#F7C1C1" : "#C0DD97"}`,
                                    }, children: [_jsx("div", { style: {
                                                width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, marginTop: "5px",
                                                background: finding.type === "risk" ? "#E24B4A" : "#639922"
                                            } }), finding.text] }, index))) })] }), error && (_jsx("div", { style: { padding: "12px", background: "#FCEBEB", color: "#791F1F", borderRadius: "8px", marginBottom: "12px", fontSize: "13px" }, children: error })), generating && _jsx(LoadingSpinner, { message: "Generating your report with AI... this may take 30 seconds" }), !generating && (_jsxs("div", { style: { display: "flex", gap: "12px" }, children: [_jsx(Button, { onClick: () => navigate("/assessment"), children: "Edit answers" }), _jsx(Button, { variant: "primary", onClick: handleGenerate, disabled: loading || generating, style: { flex: 1 }, children: "Generate full report" })] }))] })] }));
}
