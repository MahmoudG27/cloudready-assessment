import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAssessment } from "../hooks/useAssessment";
import { calculateScore, calculateConfidence } from "../utils/scoring";
import AssessmentForm from "../components/assessment/AssessmentForm";
import LoadingSpinner from "../components/common/LoadingSpinner";
export default function ClientAssessmentFlow({ token, companyName, email, industry }) {
    const { submit, generate, pollReport, loading, error } = useAssessment();
    const [generating, setGenerating] = useState(false);
    const navigate = useNavigate();
    async function handleSubmit(answers) {
        const score = calculateScore(answers);
        const confidence = calculateConfidence(answers);
        const id = await submit(companyName, answers, score, confidence, token);
        if (!id)
            return;
        setGenerating(true);
        const success = await generate(id);
        if (success) {
            const report = await pollReport(id);
            if (report) {
                // Reload the portal page — now token is completed → shows report
                window.location.reload();
            }
        }
        setGenerating(false);
    }
    if (generating)
        return _jsx(LoadingSpinner, { message: "Generating your Cloud Readiness Report... this may take 30 seconds" });
    return (_jsxs("div", { style: { minHeight: "100vh", background: "#f9fafb" }, children: [_jsxs("div", { style: {
                    background: "#fff", borderBottom: "0.5px solid #e5e7eb",
                    padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between"
                }, children: [_jsxs("span", { style: { fontSize: "15px", fontWeight: 500 }, children: ["Klayytech ", _jsx("span", { style: { color: "#185FA5" }, children: "CloudReady" })] }), _jsxs("span", { style: { fontSize: "12px", color: "#6b7280" }, children: ["Cloud Readiness Assessment \u2014 ", companyName] })] }), _jsxs("div", { style: {
                    background: "#E6F1FB", borderBottom: "0.5px solid #B5D4F4",
                    padding: "12px 24px", fontSize: "13px", color: "#0C447C"
                }, children: ["\uD83D\uDC4B Welcome! This assessment will take about 5 minutes and will generate a personalized cloud readiness report for ", _jsx("strong", { children: companyName }), "."] }), error && (_jsx("div", { style: {
                    margin: "16px 24px", padding: "12px 16px",
                    background: "#FCEBEB", color: "#791F1F",
                    borderRadius: "8px", fontSize: "13px"
                }, children: error })), _jsx(AssessmentForm, { defaultCompanyName: companyName, defaultIndustry: industry ?? undefined, onSubmit: handleSubmit, loading: loading })] }));
}
