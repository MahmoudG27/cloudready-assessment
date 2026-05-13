import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAssessment } from "../hooks/useAssessment";
import { calculateScore, calculateConfidence } from "../utils/scoring";
import { AssessmentAnswers } from "../types/assessment";
import AssessmentForm from "../components/assessment/AssessmentForm";
import LoadingSpinner from "../components/common/LoadingSpinner";

interface ClientAssessmentFlowProps {
  token: string;
  companyName: string;
  email: string;
  industry: string | null;
}

export default function ClientAssessmentFlow({
  token,
  companyName,
  email,
  industry
}: ClientAssessmentFlowProps) {
  const { submit, generate, pollReport, loading, error } = useAssessment();
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(answers: AssessmentAnswers) {
    const score = calculateScore(answers);
    const confidence = calculateConfidence(answers);

    const id = await submit(companyName, answers, score, confidence, token);
    if (!id) return;

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

  if (generating) return <LoadingSpinner message="Generating your Cloud Readiness Report... this may take 30 seconds" />;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "0.5px solid #e5e7eb",
        padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <span style={{ fontSize: "15px", fontWeight: 500 }}>
          Klayytech <span style={{ color: "#185FA5" }}>CloudReady</span>
        </span>
        <span style={{ fontSize: "12px", color: "#6b7280" }}>
          Cloud Readiness Assessment — {companyName}
        </span>
      </div>

      {/* Welcome Banner */}
      <div style={{
        background: "#E6F1FB", borderBottom: "0.5px solid #B5D4F4",
        padding: "12px 24px", fontSize: "13px", color: "#0C447C"
      }}>
        👋 Welcome! This assessment will take about 5 minutes and will generate a personalized cloud readiness report for <strong>{companyName}</strong>.
      </div>

      {error && (
        <div style={{
          margin: "16px 24px", padding: "12px 16px",
          background: "#FCEBEB", color: "#791F1F",
          borderRadius: "8px", fontSize: "13px"
        }}>
          {error}
        </div>
      )}

      {/* Reuse existing AssessmentForm component */}
      <AssessmentForm
        defaultCompanyName={companyName}
        defaultIndustry={industry ?? undefined}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}