import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAssessment } from "../hooks/useAssessment";
import { calculateScore, calculateConfidence } from "../utils/scoring";
import { AssessmentAnswers } from "../types/assessment";
import AssessmentForm from "../components/assessment/AssessmentForm";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Button from "../components/common/Button";
import Card from "../components/common/Card";


export default function AssessmentPage() {
  const navigate = useNavigate();
  const { submit, loading, error } = useAssessment();

  async function handleSubmit(answers: AssessmentAnswers) {
    const score = calculateScore(answers);
    const confidence = calculateConfidence(answers);
    const id = await submit("", answers, score, confidence);
    if (id) navigate(`/summary/${id}`);
  }

  if (loading) return <LoadingSpinner message="Saving assessment..." />;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <div style={{
        background: "#fff", borderBottom: "0.5px solid #e5e7eb",
        padding: "12px 24px", display: "flex",
        alignItems: "center", justifyContent: "space-between"
      }}>
        <span style={{ fontSize: "15px", fontWeight: 500 }}>
          Klayytech <span style={{ color: "#185FA5" }}>CloudReady</span>
        </span>
        <Button onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
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

      <AssessmentForm
        onSubmit={handleSubmit}
        loading={loading}
        showCompanyName={true}
      />
    </div>
  );
}