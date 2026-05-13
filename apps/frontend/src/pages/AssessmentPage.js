import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { useAssessment } from "../hooks/useAssessment";
import { calculateScore, calculateConfidence } from "../utils/scoring";
import AssessmentForm from "../components/assessment/AssessmentForm";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Button from "../components/common/Button";
export default function AssessmentPage() {
    const navigate = useNavigate();
    const { submit, loading, error } = useAssessment();
    async function handleSubmit(answers) {
        const score = calculateScore(answers);
        const confidence = calculateConfidence(answers);
        const id = await submit("", answers, score, confidence);
        if (id)
            navigate(`/summary/${id}`);
    }
    if (loading)
        return _jsx(LoadingSpinner, { message: "Saving assessment..." });
    return (_jsxs("div", { style: { minHeight: "100vh", background: "#f9fafb" }, children: [_jsxs("div", { style: {
                    background: "#fff", borderBottom: "0.5px solid #e5e7eb",
                    padding: "12px 24px", display: "flex",
                    alignItems: "center", justifyContent: "space-between"
                }, children: [_jsxs("span", { style: { fontSize: "15px", fontWeight: 500 }, children: ["Klayytech ", _jsx("span", { style: { color: "#185FA5" }, children: "CloudReady" })] }), _jsx(Button, { onClick: () => navigate("/dashboard"), children: "Back to dashboard" })] }), error && (_jsx("div", { style: {
                    margin: "16px 24px", padding: "12px 16px",
                    background: "#FCEBEB", color: "#791F1F",
                    borderRadius: "8px", fontSize: "13px"
                }, children: error })), _jsx(AssessmentForm, { onSubmit: handleSubmit, loading: loading, showCompanyName: true })] }));
}
