import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getReport, generatePDF, getPdfUrl, sendReport } from "../services/api";
import { AssessmentDocument, ReportData } from "../types/assessment";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Partial<AssessmentDocument> | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
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
      if (!id) return;
      try {
        const response = await getReport(id);
        if (response.success && response.data) {
          setReport(response.data);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  useEffect(() => {
    function handleScroll() {
      const content = document.getElementById("report-content");
      if (!content) return;
      let current = sections[0].id;
      sections.forEach(({ id: secId }) => {
        const el = document.getElementById(secId);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < 120) current = secId;
      });
      setActiveSection(current);
    }
    const content = document.getElementById("report-content");
    content?.addEventListener("scroll", handleScroll);
    return () => content?.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollTo(secId: string) {
    const el = document.getElementById(secId);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleDownloadPDF() {
    if (!id) return;
    setPdfLoading(true);
    try {
      if (!report?.pdfUrl) await generatePDF(id);
      const urlResponse = await getPdfUrl(id);
      if (urlResponse.success && urlResponse.data) {
        window.open(urlResponse.data.sasUrl, "_blank");
      }
    } catch {
      setMessage({ type: "error", text: "Failed to generate PDF" });
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleSendEmail() {
    if (!id || !email) return;
    setEmailLoading(true);
    try {
      const response = await sendReport(id, email);
      if (response.success) {
        setMessage({ type: "success", text: `Report sent to ${email}` });
        setShowEmailInput(false);
        setEmail("");
      }
    } catch {
      setMessage({ type: "error", text: "Failed to send email" });
    } finally {
      setEmailLoading(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading report..." />;
  if (!report?.report?.data) return (
    <div style={{ padding: "24px", textAlign: "center" }}>
      <div style={{ fontSize: "16px", color: "#dc2626", marginBottom: "12px" }}>Report not found</div>
      <Button onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
    </div>
  );

  const data: ReportData = report.report.data;
  const ui = report.report.ui;
  const score = data.readinessScore.total;

  function getScoreColor(s: number) {
    if (s >= 71) return "#639922";
    if (s >= 41) return "#BA7517";
    return "#E24B4A";
  }

  function getRiskBg(level: string) {
    if (level === "High") return { bg: "#FCEBEB", color: "#791F1F", border: "#F7C1C1", left: "#E24B4A" };
    if (level === "Medium") return { bg: "#FAEEDA", color: "#633806", border: "#FAC775", left: "#EF9F27" };
    return { bg: "#EAF3DE", color: "#27500A", border: "#C0DD97", left: "#639922" };
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
      {/* Topbar */}
      <div style={{
        background: "#fff", borderBottom: "0.5px solid #e5e7eb",
        padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0
      }}>
        <span style={{ fontSize: "15px", fontWeight: 500 }}>
          Klayytech <span style={{ color: "#185FA5" }}>CloudReady</span>
        </span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Button onClick={() => navigate("/dashboard")}>Dashboard</Button>
          <Button onClick={() => setShowEmailInput(!showEmailInput)}>Send email</Button>
          <Button variant="primary" onClick={handleDownloadPDF} disabled={pdfLoading}>
            {pdfLoading ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* Email input */}
      {showEmailInput && (
        <div style={{ background: "#E6F1FB", padding: "12px 24px", display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@company.com"
            style={{ padding: "8px 12px", border: "0.5px solid #d1d5db", borderRadius: "8px", fontSize: "13px", flex: 1 }}
          />
          <Button variant="primary" onClick={handleSendEmail} disabled={emailLoading || !email}>
            {emailLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      )}

      {message && (
        <div style={{
          padding: "10px 24px", fontSize: "13px",
          background: message.type === "success" ? "#EAF3DE" : "#FCEBEB",
          color: message.type === "success" ? "#27500A" : "#791F1F"
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{
          width: "188px", borderRight: "0.5px solid #e5e7eb",
          background: "#fff", padding: "12px 0", flexShrink: 0, overflowY: "auto"
        }}>
          <div style={{ padding: "8px 16px 4px", fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            App
          </div>
          {[
            { label: "Dashboard", action: () => navigate("/dashboard") },
            { label: "Assessments", action: () => navigate("/dashboard") },
            { label: "Reports", action: () => navigate("/dashboard") },
            { label: "Settings", action: null },
          ].map(item => (
            <div
              key={item.label}
              onClick={() => item.action?.()}
              style={{
                padding: "7px 16px",
                fontSize: "13px",
                color: item.label === "Assessments" ? "#185FA5" : item.action ? "#6b7280" : "#d1d5db",
                borderLeft: item.label === "Assessments" ? "2px solid #185FA5" : "2px solid transparent",
                background: item.label === "Assessments" ? "#E6F1FB" : "transparent",
                fontWeight: item.label === "Assessments" ? 500 : 400,
                cursor: item.action ? "pointer" : "default"
              }}
            >
              {item.label}
            </div>
          ))}
          <div style={{ height: "0.5px", background: "#e5e7eb", margin: "8px 0" }} />
          <div style={{ padding: "8px 16px 4px", fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            This report
          </div>
          {sections.map(({ id: secId, label }) => (
            <div key={secId} onClick={() => scrollTo(secId)} style={{
              padding: "5px 16px 5px 22px", fontSize: "12px",
              color: activeSection === secId ? "#185FA5" : "#6b7280",
              borderLeft: activeSection === secId ? "2px solid #185FA5" : "2px solid transparent",
              fontWeight: activeSection === secId ? 500 : 400,
              cursor: "pointer"
            }}>{label}</div>
          ))}
        </div>

        {/* Content */}
        <div id="report-content" style={{ flex: 1, padding: "20px", overflowY: "auto" }}>

          {/* Hero Block */}
          <div id="s-hero" style={{
            background: "#185FA5", borderRadius: "12px", padding: "20px 24px",
            marginBottom: "14px", color: "#fff"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "16px" }}>
              <div style={{
                width: "80px", height: "80px", borderRadius: "50%",
                border: "4px solid rgba(255,255,255,0.4)",
                background: "rgba(255,255,255,0.1)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <span style={{ fontSize: "26px", fontWeight: 500, color: "#fff", lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>/ 100</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "16px", fontWeight: 500, marginBottom: "6px", lineHeight: 1.3 }}>
                  {ui?.hero.verdict ?? `${report.companyName} — Cloud Readiness Report`}
                </div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", marginBottom: "10px" }}>
                  {ui?.hero.subtext}
                </div>
                {ui?.highlights[0] && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px", padding: "8px 12px", fontSize: "12px"
                  }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#F7C1C1", flexShrink: 0 }} />
                    {ui.highlights[0]}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", paddingTop: "16px", borderTop: "0.5px solid rgba(255,255,255,0.2)" }}>
              <button
                onClick={() => window.open("mailto:sales@klayytech.com?subject=Migration Plan Request", "_blank")}
                style={{
                  flex: 1.2, padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
                  background: "#fff", color: "#185FA5", border: "none", cursor: "pointer"
                }}
              >
                {ui?.hero.ctaPrimary ?? "Start migration plan"}
              </button>
              <button
                onClick={() => window.open("mailto:sales@klayytech.com?subject=Security Gap Assessment", "_blank")}
                style={{
                  flex: 1, padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
                  background: "rgba(255,255,255,0.12)", color: "#fff",
                  border: "0.5px solid rgba(255,255,255,0.25)", cursor: "pointer"
                }}
              >
                {ui?.hero.ctaSecondary ?? "Fix critical security gaps"}
              </button>
              <button
                onClick={() => setShowEmailInput(true)}
                style={{
                  flex: 1, padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
                  background: "rgba(255,255,255,0.12)", color: "#fff",
                  border: "0.5px solid rgba(255,255,255,0.25)", cursor: "pointer"
                }}
              >
                Talk to a cloud expert
              </button>
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", textAlign: "center", marginTop: "8px" }}>
              A KlayyTech cloud architect will contact you within 24 hours
            </div>
          </div>

          {/* Meta bar */}
          <div style={{
            background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px",
            padding: "12px 20px", marginBottom: "14px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px"
          }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 500 }}>{report.companyName} — Cloud readiness report</div>
              <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                {data.companyOverview.industry} · {data.companyOverview.companySize} employees · {new Date(report.meta?.generatedAt ?? "").toLocaleDateString()}
              </div>
              <div style={{ display: "flex", gap: "6px", marginTop: "5px", flexWrap: "wrap" }}>
                {[
                  { text: report.id, bg: "#f3f4f6", color: "#6b7280" },
                  { text: "Azure OpenAI powered", bg: "#EEEDFE", color: "#3C3489" },
                  { text: "Reviewed by KlayyTech", bg: "#E1F5EE", color: "#085041" },
                  { text: data.companyOverview.industry, bg: "#E6F1FB", color: "#0C447C" },
                ].map((badge) => (
                  <span key={badge.text} style={{
                    fontSize: "10px", padding: "2px 8px", borderRadius: "20px",
                    background: badge.bg, color: badge.color
                  }}>{badge.text}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 01 Company Overview */}
          <Card>
            <div id="s-overview" style={{ scrollMarginTop: "8px" }}>
              <div style={{ fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                01 · Company overview
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "10px" }}>
                {[
                  { label: "Industry", value: data.companyOverview.industry },
                  { label: "Company size", value: data.companyOverview.companySize },
                  { label: "IT maturity", value: data.companyOverview.itMaturityLevel, color: "#BA7517" },
                ].map((item) => (
                  <div key={item.label} style={{ background: "#f9fafb", borderRadius: "8px", padding: "10px 12px" }}>
                    <div style={{ fontSize: "10px", color: "#6b7280", marginBottom: "3px" }}>{item.label}</div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: item.color ?? "#111827" }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.5, padding: "10px 12px", background: "#f9fafb", borderRadius: "8px" }}>
                {data.companyOverview.itMaturityReason}
              </div>
            </div>
          </Card>

          {/* 02 Score */}
          <Card>
            <div id="s-score" style={{ scrollMarginTop: "8px" }}>
              <div style={{ fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                02 · Cloud readiness score
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "14px" }}>
                <div style={{
                  width: "96px", height: "96px", borderRadius: "50%",
                  border: `6px solid ${getScoreColor(score)}`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <span style={{ fontSize: "10px", color: "#6b7280" }}>Your position</span>
                  <span style={{ fontSize: "30px", fontWeight: 500, color: getScoreColor(score), lineHeight: 1 }}>{score}</span>
                  <span style={{ fontSize: "10px", color: "#6b7280" }}>/ 100</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "3px" }}>Current cloud readiness level</div>
                  <span style={{
                    display: "inline-block", padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 500, marginBottom: "8px",
                    background: score >= 71 ? "#EAF3DE" : score >= 41 ? "#FAEEDA" : "#FCEBEB",
                    color: score >= 71 ? "#27500A" : score >= 41 ? "#633806" : "#791F1F",
                  }}>
                    {data.readinessScore.level}
                  </span>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>
                    {data.cloudMaturityPosition}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", color: "#6b7280" }}>
                    <span>AI confidence</span>
                    <div style={{ width: "70px", height: "4px", background: "#e5e7eb", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: `${report.meta?.confidenceScore ?? 82}%`, height: "100%", background: "#1D9E75", borderRadius: "2px" }} />
                    </div>
                    <span>{report.meta?.confidenceScore ?? 82}%</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
                {[
                  { label: "Infrastructure", value: data.readinessScore.breakdown.infrastructure, color: "#185FA5" },
                  { label: "Security", value: data.readinessScore.breakdown.security, color: data.readinessScore.breakdown.security < 50 ? "#E24B4A" : "#185FA5" },
                  { label: "Team readiness", value: data.readinessScore.breakdown.teamReadiness, color: "#639922" },
                ].map((item) => (
                  <div key={item.label} style={{ background: "#f9fafb", borderRadius: "8px", padding: "10px" }}>
                    <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "5px" }}>{item.label}</div>
                    <div style={{ height: "5px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden", marginBottom: "4px" }}>
                      <div style={{ width: `${item.value}%`, height: "100%", background: item.color, borderRadius: "3px" }} />
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 500 }}>{item.value}%</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* 03 Key Findings */}
          <Card>
            <div id="s-findings" style={{ scrollMarginTop: "8px" }}>
              <div style={{ fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                03 · Key findings — facts detected
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
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, marginTop: "5px", background: finding.type === "risk" ? "#E24B4A" : "#639922" }} />
                    {finding.text}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* 04 Risk Assessment */}
          <Card>
            <div id="s-risks" style={{ scrollMarginTop: "8px" }}>
              <div style={{ fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                04 · Risk assessment — business impact
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {data.riskAssessment.map((risk, i) => {
                  const c = getRiskBg(risk.level);
                  return (
                    <div key={i} style={{ padding: "11px 14px", borderRadius: "8px", borderLeft: `3px solid ${c.left}`, background: c.bg }}>
                      <div style={{ fontSize: "12px", fontWeight: 500, color: c.color, marginBottom: "2px" }}>{risk.risk}</div>
                      <div style={{ fontSize: "11px", fontWeight: 500, color: c.color, marginBottom: "2px" }}>Business impact: {risk.businessImpact}</div>
                      <div style={{ fontSize: "11px", color: "#6b7280" }}>Mitigation: {risk.mitigation}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginTop: "12px", paddingTop: "12px", borderTop: "0.5px solid #e5e7eb" }}>
                {[
                  { label: "Estimated downtime risk", value: "$5K – $20K / incident", color: "#A32D2D" },
                  { label: "Infra overhead reduction", value: "~30% after migration", color: "#27500A" },
                  { label: "Compliance gap cost", value: "High — unquantified", color: "#A32D2D" },
                ].map((item) => (
                  <div key={item.label} style={{ background: "#f9fafb", borderRadius: "8px", padding: "10px 12px" }}>
                    <div style={{ fontSize: "10px", color: "#6b7280", marginBottom: "3px" }}>{item.label}</div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* 05 Recommended Services */}
          <Card>
            <div id="s-services" style={{ scrollMarginTop: "8px" }}>
              <div style={{ fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                05 · Recommended Azure services
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {data.recommendedServices.map((svc, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: "11px",
                    padding: "11px 14px", background: "#f9fafb", borderRadius: "8px",
                    border: "0.5px solid transparent"
                  }}>
                    <div style={{
                      width: "30px", height: "30px", borderRadius: "8px",
                      background: "#E6F1FB", display: "flex", alignItems: "center",
                      justifyContent: "center", flexShrink: 0, fontSize: "14px"
                    }}>
                      {["🌐", "🗄️", "🛡️", "💾", "🔑", "📊"][i % 6]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "#0C447C", marginBottom: "2px" }}>{svc.service}</div>
                      <div style={{ fontSize: "12px", fontWeight: 500, color: "#111827", marginBottom: "2px" }}>{svc.outcome}</div>
                      <div style={{ fontSize: "11px", color: "#6b7280" }}>Why it fits: {svc.whyItFits}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* 06 Architecture */}
          <Card>
            <div id="s-arch" style={{ scrollMarginTop: "8px" }}>
              <div style={{ fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                06 · Architecture suggestion
              </div>
              {["App", "Data", "Security"].map((layer) => {
                const items = data.architectureSuggestion.filter(a => a.layer === layer);
                if (!items.length) return null;
                return (
                  <div key={layer} style={{ border: "0.5px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", marginBottom: "10px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", padding: "6px 12px", background: "#f9fafb", borderBottom: "0.5px solid #e5e7eb", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {layer} layer
                    </div>
                    <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {items.map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ padding: "7px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, border: "0.5px solid #e5e7eb", background: "#f9fafb", color: "#111827", minWidth: "130px", textAlign: "center" }}>
                            {item.component}
                          </div>
                          <div style={{ padding: "0 10px", fontSize: "13px", color: "#6b7280" }}>→</div>
                          <div style={{ padding: "7px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, border: "0.5px solid #B5D4F4", background: "#E6F1FB", color: "#0C447C", minWidth: "150px", textAlign: "center" }}>
                            {item.azureService}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 07 Roadmap */}
          <Card>
            <div id="s-roadmap" style={{ scrollMarginTop: "8px" }}>
              <div style={{ fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                07 · Migration roadmap
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {data.migrationRoadmap.map((phase, i) => (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: "8px", borderLeft: "3px solid #185FA5", background: "#f9fafb" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "7px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 500, color: "#111827" }}>Phase {phase.phase}: {phase.title}</span>
                      <span style={{ fontSize: "10px", color: "#6b7280", background: "#fff", border: "0.5px solid #e5e7eb", padding: "2px 8px", borderRadius: "20px" }}>
                        {phase.estimatedDuration}
                      </span>
                    </div>
                    {phase.activities.map((act, j) => (
                      <div key={j} style={{ fontSize: "11px", color: "#6b7280", paddingLeft: "12px", marginBottom: "3px", position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, top: "6px", width: "4px", height: "4px", borderRadius: "50%", background: "#d1d5db", display: "block" }} />
                        {act}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "8px", padding: "8px 14px", background: "#f9fafb", borderRadius: "8px", fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Estimated total migration timeline</span>
                <span style={{ fontWeight: 500, color: "#111827" }}>3–4 months</span>
              </div>
            </div>
          </Card>

          {/* 08 Cost */}
          <Card>
            <div id="s-cost" style={{ scrollMarginTop: "8px" }}>
              <div style={{ fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                08 · Estimated cost & ROI
              </div>
              <div style={{ marginBottom: "6px" }}>
                <span style={{ fontSize: "30px", fontWeight: 500, color: "#111827", lineHeight: 1 }}>
                  ${data.estimatedMonthlyCost.min} – ${data.estimatedMonthlyCost.max}
                </span>
                <span style={{ fontSize: "14px", color: "#6b7280", marginLeft: "4px" }}>/ month</span>
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.5, marginBottom: "10px" }}>
                {data.estimatedMonthlyCost.notes}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", paddingTop: "10px", borderTop: "0.5px solid #e5e7eb" }}>
                <div style={{ padding: "10px 12px", borderRadius: "8px", background: "#FCEBEB" }}>
                  <div style={{ fontSize: "10px", color: "#A32D2D", marginBottom: "3px" }}>Cost of NOT migrating</div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#791F1F" }}>$5K – $20K per incident</div>
                </div>
                <div style={{ padding: "10px 12px", borderRadius: "8px", background: "#EAF3DE" }}>
                  <div style={{ fontSize: "10px", color: "#3B6D11", marginBottom: "3px" }}>Expected overhead reduction</div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#27500A" }}>~30% after full migration</div>
                </div>
              </div>
            </div>
          </Card>

          {/* 09 Next Steps */}
          <Card>
            <div id="s-next" style={{ scrollMarginTop: "8px" }}>
              <div style={{ fontSize: "10px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                09 · Next steps
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {data.nextSteps.map((step, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 14px", borderRadius: "8px", fontSize: "12px",
                    background: i === 0 ? "#E6F1FB" : "#f9fafb",
                    border: i === 0 ? "0.5px solid #B5D4F4" : "none",
                    color: "#111827"
                  }}>
                    <div style={{
                      width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                      background: i === 0 ? "#185FA5" : "#fff",
                      border: i === 0 ? "none" : "0.5px solid #e5e7eb",
                      color: i === 0 ? "#fff" : "#6b7280",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "10px", fontWeight: 500
                    }}>
                      {i + 1}
                    </div>
                    {typeof step === "string" ? step : (step as any).step ?? JSON.stringify(step)}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div style={{
            background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: "12px",
            padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "0"
          }}>
            <div style={{ fontSize: "11px", color: "#6b7280", marginRight: "auto", lineHeight: 1.5 }}>
              {report.id} · KlayyTech CloudReady · Azure OpenAI powered<br />
              Reviewed by KlayyTech Cloud Team · Confidence: {report.meta?.confidenceScore ?? 82}%
            </div>
            <Button onClick={() => setShowEmailInput(true)}>Send to client</Button>
            <Button variant="primary" onClick={handleDownloadPDF} disabled={pdfLoading}>
              {pdfLoading ? "Generating..." : "Download PDF"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}