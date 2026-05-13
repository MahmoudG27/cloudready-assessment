import { useEffect, useState } from "react";
import { getReport } from "../services/api";
import { AssessmentDocument, ReportData } from "../types/assessment";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";

interface ClientReportPageProps {
  assessmentId: string;
  token: string;
}

export default function ClientReportPage({ assessmentId, token }: ClientReportPageProps) {
  const [report, setReport] = useState<Partial<AssessmentDocument> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await getReport(assessmentId);
        if (response.success && response.data) {
          setReport(response.data);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [assessmentId]);

  if (loading) return <LoadingSpinner message="Loading your report..." />;
  if (!report?.report?.data) return (
    <div style={{ padding: "24px", textAlign: "center", color: "#dc2626" }}>
      Report not available
    </div>
  );

  const data: ReportData = report.report.data;
  const score = data.readinessScore.total;

  function getScoreColor(s: number) {
    if (s >= 71) return "#639922";
    if (s >= 41) return "#BA7517";
    return "#E24B4A";
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Header */}
      <div style={{
        background: "#185FA5", padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <span style={{ color: "#fff", fontSize: "15px", fontWeight: 500 }}>
          Klayytech <span style={{ color: "#B5D4F4" }}>CloudReady</span>
        </span>
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
          {report.companyName} — Cloud Readiness Report
        </span>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>

        {/* Read-only notice */}
        <div style={{
          background: "#E6F1FB", border: "0.5px solid #B5D4F4",
          borderRadius: "8px", padding: "10px 16px",
          fontSize: "12px", color: "#0C447C", marginBottom: "20px",
          display: "flex", alignItems: "center", gap: "8px"
        }}>
          <span>📄</span>
          This is your personalized cloud readiness report. 
          To discuss next steps, contact your KlayyTech representative.
        </div>

        {/* Hero Score */}
        <div style={{
          background: "#185FA5", borderRadius: "12px",
          padding: "24px", marginBottom: "16px", color: "#fff"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{
              width: "88px", height: "88px", borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.1)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <span style={{ fontSize: "28px", fontWeight: 600, lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: "10px", opacity: 0.7 }}>/ 100</span>
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>
                {report.report.ui?.hero.verdict}
              </div>
              <div style={{ fontSize: "13px", opacity: 0.8, marginBottom: "12px" }}>
                {report.report.ui?.hero.subtext}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <a
                  href="mailto:info@klayytech.com?subject=Cloud Migration Consultation"
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 500,
                    background: "#fff",
                    color: "#185FA5",
                    textDecoration: "none",
                    display: "inline-block"
                  }}
                >
                  Talk to a cloud expert
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <Card>
          <div style={{ fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
            Cloud Readiness Score
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
            {[
              { label: "Infrastructure", value: data.readinessScore.breakdown.infrastructure, color: "#185FA5" },
              { label: "Security", value: data.readinessScore.breakdown.security, color: data.readinessScore.breakdown.security < 50 ? "#E24B4A" : "#185FA5" },
              { label: "Team Readiness", value: data.readinessScore.breakdown.teamReadiness, color: "#639922" },
            ].map((item) => (
              <div key={item.label} style={{ background: "#f9fafb", borderRadius: "8px", padding: "12px" }}>
                <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "6px" }}>{item.label}</div>
                <div style={{ height: "5px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden", marginBottom: "6px" }}>
                  <div style={{ width: `${item.value}%`, height: "100%", background: item.color, borderRadius: "3px" }} />
                </div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{item.value}%</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Key Findings */}
        <Card>
          <div style={{ fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
            Key Findings
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {data.keyFindings.map((finding, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "9px",
                padding: "9px 12px", borderRadius: "8px", fontSize: "12px", lineHeight: 1.5,
                background: finding.type === "risk" ? "#FCEBEB" : "#EAF3DE",
                color: finding.type === "risk" ? "#791F1F" : "#27500A",
                border: `0.5px solid ${finding.type === "risk" ? "#F7C1C1" : "#C0DD97"}`,
              }}>
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                  marginTop: "5px", background: finding.type === "risk" ? "#E24B4A" : "#639922"
                }} />
                {finding.text}
              </div>
            ))}
          </div>
        </Card>

        {/* Recommended Services */}
        <Card>
          <div style={{ fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
            Recommended Azure Services
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.recommendedServices.map((svc, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "10px",
                padding: "10px 14px", background: "#f9fafb", borderRadius: "8px"
              }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "6px",
                  background: "#E6F1FB", display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0, fontSize: "12px"
                }}>Az</div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#0C447C" }}>{svc.service}</div>
                  <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>{svc.outcome}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Cost */}
        <Card>
          <div style={{ fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
            Estimated Monthly Cost
          </div>
          <div style={{ fontSize: "28px", fontWeight: 500, color: "#111827" }}>
            ${data.estimatedMonthlyCost.min} – ${data.estimatedMonthlyCost.max}
            <span style={{ fontSize: "14px", color: "#6b7280", marginLeft: "6px" }}>/ month</span>
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
            {data.estimatedMonthlyCost.notes}
          </div>
        </Card>

        {/* CTA Footer */}
        <div style={{
          background: "#185FA5", borderRadius: "12px",
          padding: "20px 24px", textAlign: "center", color: "#fff"
        }}>
          <div style={{ fontSize: "15px", fontWeight: 500, marginBottom: "6px" }}>
            Ready to start your cloud journey?
          </div>
          <div style={{ fontSize: "13px", opacity: 0.8, marginBottom: "16px" }}>
            A KlayyTech cloud architect will guide you through every step.
          </div>
          
          <div style={{ display: "flex", gap: "8px" }}>
            <a
                href="mailto:support@klayytech.com?subject=Cloud Migration Consultation"
                style={{
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 500,
                background: "#fff",
                color: "#185FA5",
                textDecoration: "none",
                display: "inline-block"
                }}
            >
                Talk to a cloud expert
            </a>
          </div>
        </div>  

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "16px", fontSize: "11px", color: "#9ca3af" }}>
          {report.id} · KlayyTech CloudReady · Powered by Azure OpenAI
        </div>
      </div>
    </div>
  );
}