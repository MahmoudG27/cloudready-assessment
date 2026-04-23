import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAssessment } from "../hooks/useAssessment";
import { calculateScore } from "../utils/scoring";
import { AssessmentAnswers } from "../types/assessment";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";

const SECTIONS = [
  "Company Profile",
  "Infrastructure",
  "Applications",
  "Security",
  "Budget & Timeline",
];

const INITIAL_ANSWERS: AssessmentAnswers = {
  industry: "",
  companySize: "",
  itTeam: "",
  infrastructure: "",
  infraAge: "",
  microsoftProducts: "",
  systems: [],
  downtimeCriticality: "",
  newApps: "",
  sensitiveData: "",
  securityIncidents: "",
  compliance: "",
  budget: "",
  timeline: "",
  primaryGoal: "",
  backupSolution: "",
};

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { submit, loading, error } = useAssessment();
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [answers, setAnswers] = useState<AssessmentAnswers>(INITIAL_ANSWERS);

  function setAnswer(key: keyof AssessmentAnswers, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSystem(system: string) {
    setAnswers((prev) => ({
      ...prev,
      systems: prev.systems.includes(system)
        ? prev.systems.filter((s) => s !== system)
        : [...prev.systems, system],
    }));
  }

  function isStepValid(): boolean {
    switch (step) {
      case 0: return companyName.trim() !== "" && answers.industry !== "" && answers.companySize !== "" && answers.itTeam !== "";
      case 1: return answers.infrastructure !== "" && answers.infraAge !== "" && answers.microsoftProducts !== "";
      case 2: return answers.systems.length > 0 && answers.downtimeCriticality !== "" && answers.newApps !== "";
      case 3: return answers.sensitiveData !== "" && answers.securityIncidents !== "" && answers.compliance !== "";
      case 4: return answers.budget !== "" && answers.timeline !== "" && answers.primaryGoal !== "";
      default: return false;
    }
  }

  async function handleSubmit() {
    const score = calculateScore(answers);
    const id = await submit(companyName, answers, score);
    if (id) navigate(`/summary/${id}`);
  }

  function renderOption(key: keyof AssessmentAnswers, value: string, label: string) {
    const current = answers[key] as string;
    const selected = current === value;
    return (
      <div
        key={value}
        onClick={() => setAnswer(key, value)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
          border: selected ? "1.5px solid #185FA5" : "0.5px solid #e5e7eb",
          borderRadius: "8px",
          cursor: "pointer",
          background: selected ? "#E6F1FB" : "#fff",
          marginBottom: "8px",
          fontSize: "13px",
          color: selected ? "#0C447C" : "#374151",
        }}
      >
        <div style={{
          width: "16px", height: "16px", borderRadius: "50%",
          border: selected ? "none" : "1.5px solid #d1d5db",
          background: selected ? "#185FA5" : "transparent",
          flexShrink: 0
        }} />
        {label}
      </div>
    );
  }

  function renderMultiOption(value: string, label: string) {
    const selected = answers.systems.includes(value);
    return (
      <div
        key={value}
        onClick={() => toggleSystem(value)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
          border: selected ? "1.5px solid #185FA5" : "0.5px solid #e5e7eb",
          borderRadius: "8px",
          cursor: "pointer",
          background: selected ? "#E6F1FB" : "#fff",
          marginBottom: "8px",
          fontSize: "13px",
          color: selected ? "#0C447C" : "#374151",
        }}
      >
        <div style={{
          width: "16px", height: "16px", borderRadius: "3px",
          border: selected ? "none" : "1.5px solid #d1d5db",
          background: selected ? "#185FA5" : "transparent",
          flexShrink: 0
        }} />
        {label}
      </div>
    );
  }

  const steps = [
    // Step 0 — Company Profile
    <div>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
          Company name *
        </label>
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. MedCare Egypt"
          style={{
            width: "100%", padding: "10px 12px", border: "0.5px solid #d1d5db",
            borderRadius: "8px", fontSize: "13px", outline: "none"
          }}
        />
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
          What is your company's primary industry? *
        </label>
        {["Retail", "Healthcare", "Fintech", "SaaS", "Manufacturing", "Other"].map(v =>
          renderOption("industry", v, v)
        )}
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
          How many employees does your company have? *
        </label>
        {["1–10", "11–50", "51–200", "200+"].map(v => renderOption("companySize", v, v))}
      </div>
      <div>
        <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
          Do you have a dedicated IT team? *
        </label>
        {[
          ["Yes, a full IT team", "Yes, a full IT team"],
          ["Yes, 1-2 IT personnel", "Yes, 1–2 IT personnel"],
          ["No in-house IT team", "No in-house IT team"],
        ].map(([v, l]) => renderOption("itTeam", v, l))}
      </div>
    </div>,

    // Step 1 — Infrastructure
    <div>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
          Where is your current IT infrastructure hosted? *
        </label>
        {[
          ["On-premises (own servers)", "On-premises (own servers)"],
          ["Third-party hosting", "Third-party hosting"],
          ["Partially on cloud (hybrid)", "Partially on cloud (hybrid)"],
          ["No existing infrastructure", "No existing infrastructure"],
        ].map(([v, l]) => renderOption("infrastructure", v, l))}
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
          How would you describe the age of your infrastructure? *
        </label>
        {[
          ["Less than 2 years", "Less than 2 years"],
          ["2-5 years", "2–5 years"],
          ["More than 5 years", "More than 5 years"],
          ["Not sure", "Not sure"],
        ].map(([v, l]) => renderOption("infraAge", v, l))}
      </div>
      <div>
        <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
          Which Microsoft technologies are you currently using? *
        </label>
        {[
          ["Microsoft 365", "Microsoft 365"],
          ["Windows Server", "Windows Server"],
          ["Both", "Both"],
          ["None", "None"],
        ].map(([v, l]) => renderOption("microsoftProducts", v, l))}
      </div>
    </div>,

    // Step 2 — Applications
    <div>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
          Which systems do you currently use? (select all that apply) *
        </label>
        {["ERP system", "CRM system", "Company website", "Email server", "File storage", "Custom-built applications"].map(v =>
          renderMultiOption(v, v)
        )}
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
          How critical is application downtime? *
        </label>
        {[
          ["Mission-critical (no downtime acceptable)", "Mission-critical (no downtime acceptable)"],
          ["Moderate (a few hours acceptable)", "Moderate (a few hours acceptable)"],
          ["Low impact", "Low impact"],
        ].map(([v, l]) => renderOption("downtimeCriticality", v, l))}
      </div>
      <div>
        <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
          Are you planning to develop new applications? *
        </label>
        {["Yes", "No", "Not sure"].map(v => renderOption("newApps", v, v))}
      </div>
    </div>,

    // Step 3 — Security
    <div>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
          Do you handle sensitive customer data? *
        </label>
        {["Yes", "No", "Not sure"].map(v => renderOption("sensitiveData", v, v))}
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
          Have you experienced any security incidents in the past 2 years? *
        </label>
        {["Yes", "No", "Prefer not to say"].map(v => renderOption("securityIncidents", v, v))}
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
          Do you have regulatory or compliance requirements? *
        </label>
        {[
          ["Yes (e.g., GDPR, ISO)", "Yes (e.g., GDPR, ISO)"],
          ["No", "No"],
          ["Not sure", "Not sure"],
        ].map(([v, l]) => renderOption("compliance", v, l))}
      </div>
      <div>
        <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
          Do you have a backup or disaster recovery solution? (optional)
        </label>
        {[
          ["Yes, fully implemented", "Yes, fully implemented"],
          ["Partial solution", "Partial solution"],
          ["No", "No"],
          ["Not sure", "Not sure"],
        ].map(([v, l]) => renderOption("backupSolution", v, l))}
      </div>
    </div>,

    // Step 4 — Budget & Timeline
    <div>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
          What is your estimated monthly budget for cloud services? *
        </label>
        {[
          ["Less than $500", "Less than $500"],
          ["$500-$2000", "$500 – $2,000"],
          ["$2000-$5000", "$2,000 – $5,000"],
          ["More than $5000", "More than $5,000"],
        ].map(([v, l]) => renderOption("budget", v, l))}
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
          When are you planning to start your cloud adoption journey? *
        </label>
        {[
          ["Immediately", "Immediately"],
          ["Within 3 months", "Within 3 months"],
          ["Within 6 months", "Within 6 months"],
          ["Just exploring", "Just exploring"],
        ].map(([v, l]) => renderOption("timeline", v, l))}
      </div>
      <div>
        <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
          What is your primary objective for moving to the cloud? *
        </label>
        {[
          ["Cost optimization", "Cost optimization"],
          ["Security improvement", "Security improvement"],
          ["Scalability", "Scalability"],
          ["Remote work enablement", "Remote work enablement"],
          ["All of the above", "All of the above"],
        ].map(([v, l]) => renderOption("primaryGoal", v, l))}
      </div>
    </div>,
  ];

  if (loading) return <LoadingSpinner message="Saving assessment..." />;

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
        <Button onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
      </div>

      <div style={{ padding: "24px", maxWidth: "680px", margin: "0 auto" }}>
        {/* Steps indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px", gap: "0" }}>
          {SECTIONS.map((section, index) => (
            <div key={section} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "50%",
                  background: index < step ? "#185FA5" : index === step ? "#185FA5" : "#e5e7eb",
                  color: index <= step ? "#fff" : "#9ca3af",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 500, flexShrink: 0
                }}>
                  {index < step ? "✓" : index + 1}
                </div>
                <span style={{
                  fontSize: "10px",
                  color: index === step ? "#185FA5" : "#9ca3af",
                  fontWeight: index === step ? 500 : 400,
                  whiteSpace: "nowrap"
                }}>
                  {section}
                </span>
              </div>
              {index < SECTIONS.length - 1 && (
                <div style={{
                  flex: 1, height: "1px",
                  background: index < step ? "#185FA5" : "#e5e7eb",
                  margin: "0 4px", marginBottom: "16px"
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Progress */}
        <div style={{ marginBottom: "8px", fontSize: "12px", color: "#6b7280" }}>
          Section {step + 1} of {SECTIONS.length}
        </div>
        <div style={{ height: "4px", background: "#e5e7eb", borderRadius: "2px", marginBottom: "20px", overflow: "hidden" }}>
          <div style={{
            height: "100%", background: "#185FA5", borderRadius: "2px",
            width: `${((step + 1) / SECTIONS.length) * 100}%`,
            transition: "width 0.3s"
          }} />
        </div>

        {/* Section title */}
        <div style={{ fontSize: "18px", fontWeight: 500, marginBottom: "4px" }}>
          {SECTIONS[step]}
        </div>
        <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>
          {step === 0 && "Tell us about your company"}
          {step === 1 && "Tell us about your existing IT setup"}
          {step === 2 && "Tell us about your applications and workloads"}
          {step === 3 && "Tell us about your security and compliance"}
          {step === 4 && "Tell us about your budget and timeline"}
        </div>

        {/* Questions */}
        <Card>{steps[step]}</Card>

        {error && (
          <div style={{ padding: "12px", background: "#FCEBEB", color: "#791F1F", borderRadius: "8px", marginBottom: "12px", fontSize: "13px" }}>
            {error}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            onClick={() => setStep((prev) => prev - 1)}
            disabled={step === 0}
          >
            Back
          </Button>
          {step < SECTIONS.length - 1 ? (
            <Button
              variant="primary"
              onClick={() => setStep((prev) => prev + 1)}
              disabled={!isStepValid()}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!isStepValid() || loading}
            >
              Submit assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}