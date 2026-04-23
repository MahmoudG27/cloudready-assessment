import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssessments } from "../services/api";
import { AssessmentDocument } from "../types/assessment";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Partial<AssessmentDocument>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAssessments() {
      try {
        const response = await getAssessments();
        if (response.success) {
          setAssessments(response.data);
        } else {
          setError(response.error || "Failed to load assessments");
        }
      } catch {
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    }
    fetchAssessments();
  }, []);

  function getStatusBadge(status: string) {
    const styles: Record<string, React.CSSProperties> = {
      completed: { background: "#EAF3DE", color: "#27500A" },
      generating: { background: "#E6F1FB", color: "#0C447C" },
      draft: { background: "#F1EFE8", color: "#5F5E5A" },
      failed: { background: "#FCEBEB", color: "#791F1F" },
    };
    return (
      <span style={{
        ...styles[status] || styles.draft,
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 500
      }}>
        {status}
      </span>
    );
  }

  function getScoreColor(score: number) {
    if (score >= 71) return "#639922";
    if (score >= 41) return "#BA7517";
    return "#E24B4A";
  }

  if (loading) return <LoadingSpinner message="Loading assessments..." />;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Topbar */}
      <div style={{
        background: "#fff",
        borderBottom: "0.5px solid #e5e7eb",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <span style={{ fontSize: "15px", fontWeight: 500 }}>
          Klayytech <span style={{ color: "#185FA5" }}>CloudReady</span>
        </span>
        <Button variant="primary" onClick={() => navigate("/assessment")}>
          + New assessment
        </Button>
      </div>

      <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {[
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
          ].map((metric) => (
            <div key={metric.label} style={{
              background: "#f3f4f6",
              borderRadius: "8px",
              padding: "14px 16px"
            }}>
              <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "6px" }}>{metric.label}</div>
              <div style={{ fontSize: "22px", fontWeight: 500, color: metric.color }}>{metric.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <Card>
          <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "16px" }}>
            Recent assessments
          </div>

          {error && (
            <div style={{ padding: "12px", background: "#FCEBEB", color: "#791F1F", borderRadius: "8px", marginBottom: "12px", fontSize: "13px" }}>
              {error}
            </div>
          )}

          {assessments.length === 0 && !error ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#6b7280" }}>
              <div style={{ fontSize: "16px", fontWeight: 500, marginBottom: "8px" }}>
                No assessments yet
              </div>
              <div style={{ fontSize: "13px", marginBottom: "20px" }}>
                Start your first cloud readiness evaluation
              </div>
              <Button variant="primary" onClick={() => navigate("/assessment")}>
                Start assessment
              </Button>
            </div>
          ) : (
            <div>
              {/* Table Header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr",
                padding: "8px 12px",
                background: "#f9fafb",
                borderRadius: "8px",
                marginBottom: "4px"
              }}>
                {["Company", "Industry", "Score", "Level", "Actions"].map(h => (
                  <span key={h} style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>{h}</span>
                ))}
              </div>

              {/* Table Rows */}
              {assessments.map((assessment) => {
                const score = assessment.report?.data?.readinessScore?.total ?? 0;
                return (
                  <div key={assessment.id} style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr",
                    padding: "12px",
                    borderBottom: "0.5px solid #e5e7eb",
                    alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 500 }}>{assessment.companyName}</div>
                      <div style={{ fontSize: "11px", color: "#6b7280" }}>
                        {new Date(assessment.createdAt!).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{ fontSize: "13px", color: "#6b7280" }}>
                      {assessment.report?.data?.companyOverview?.industry ?? "—"}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ flex: 1, height: "6px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${score}%`, height: "100%", background: getScoreColor(score), borderRadius: "3px" }} />
                      </div>
                      <span style={{ fontSize: "12px", minWidth: "24px" }}>{score}</span>
                    </div>
                    <span>{getStatusBadge(assessment.status ?? "draft")}</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Button
                        onClick={() => navigate(`/report/${assessment.id}`)}
                        disabled={assessment.status !== "completed"}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}