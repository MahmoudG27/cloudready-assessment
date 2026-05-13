import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
const SECTIONS = [
    "Company Profile",
    "Infrastructure",
    "Applications",
    "Security",
    "Budget & Timeline",
];
const INITIAL_ANSWERS = {
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
    infrastructureType: "",
    systemAvailability: "",
    peakUsage: "",
    sensitiveDataType: "",
    accessControl: "",
    priority: "",
};
export default function AssessmentForm({ defaultCompanyName = "", defaultIndustry = "", onSubmit, loading = false, showCompanyName = true, }) {
    const [step, setStep] = useState(0);
    const [companyName, setCompanyName] = useState(defaultCompanyName);
    const [answers, setAnswers] = useState({
        ...INITIAL_ANSWERS,
        industry: defaultIndustry,
    });
    function setAnswer(key, value) {
        setAnswers((prev) => ({ ...prev, [key]: value }));
    }
    function toggleSystem(system) {
        setAnswers((prev) => ({
            ...prev,
            systems: prev.systems.includes(system)
                ? prev.systems.filter((s) => s !== system)
                : [...prev.systems, system],
        }));
    }
    function isStepValid() {
        switch (step) {
            case 0:
                return ((!showCompanyName || companyName.trim() !== "") &&
                    answers.industry !== "" &&
                    answers.companySize !== "" &&
                    answers.itTeam !== "");
            case 1:
                return (answers.infrastructure !== "" &&
                    answers.infraAge !== "" &&
                    answers.microsoftProducts !== "" &&
                    answers.infrastructureType !== "" &&
                    answers.systemAvailability !== "");
            case 2:
                return (answers.systems.length > 0 &&
                    answers.downtimeCriticality !== "" &&
                    answers.newApps !== "" &&
                    answers.peakUsage !== "");
            case 3:
                return (answers.sensitiveDataType !== "" &&
                    answers.securityIncidents !== "" &&
                    answers.compliance !== "" &&
                    answers.accessControl !== "");
            case 4:
                return (answers.budget !== "" &&
                    answers.timeline !== "" &&
                    answers.primaryGoal !== "" &&
                    answers.priority !== "");
            default:
                return false;
        }
    }
    function renderOption(key, value, label) {
        const current = answers[key];
        const selected = current === value;
        return (_jsxs("div", { onClick: () => setAnswer(key, value), style: {
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px",
                border: selected ? "1.5px solid #185FA5" : "0.5px solid #e5e7eb",
                borderRadius: "8px", cursor: "pointer",
                background: selected ? "#E6F1FB" : "#fff",
                marginBottom: "8px", fontSize: "13px",
                color: selected ? "#0C447C" : "#374151",
            }, children: [_jsx("div", { style: {
                        width: "16px", height: "16px", borderRadius: "50%",
                        border: selected ? "none" : "1.5px solid #d1d5db",
                        background: selected ? "#185FA5" : "transparent",
                        flexShrink: 0
                    } }), label] }, value));
    }
    function renderMultiOption(value, label) {
        const selected = answers.systems.includes(value);
        return (_jsxs("div", { onClick: () => toggleSystem(value), style: {
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px",
                border: selected ? "1.5px solid #185FA5" : "0.5px solid #e5e7eb",
                borderRadius: "8px", cursor: "pointer",
                background: selected ? "#E6F1FB" : "#fff",
                marginBottom: "8px", fontSize: "13px",
                color: selected ? "#0C447C" : "#374151",
            }, children: [_jsx("div", { style: {
                        width: "16px", height: "16px", borderRadius: "3px",
                        border: selected ? "none" : "1.5px solid #d1d5db",
                        background: selected ? "#185FA5" : "transparent",
                        flexShrink: 0
                    } }), label] }, value));
    }
    const steps = [
        _jsxs("div", { children: [showCompanyName && (_jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "Company name *" }), _jsx("input", { value: companyName, onChange: (e) => setCompanyName(e.target.value), placeholder: "e.g. MedCare Egypt", style: {
                                width: "100%", padding: "10px 12px",
                                border: "0.5px solid #d1d5db", borderRadius: "8px",
                                fontSize: "13px", outline: "none", boxSizing: "border-box"
                            } })] })), _jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "What is your company's primary industry? *" }), ["Retail", "Healthcare", "Fintech", "SaaS", "Manufacturing", "Other"].map(v => renderOption("industry", v, v))] }), _jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "How many employees AND active system users? *" }), [
                            ["1–10", "1–10 employees (≤5 users)"],
                            ["11–50", "11–50 employees (5–25 users)"],
                            ["51–200", "51–200 employees (25–100 users)"],
                            ["200+", "200+ employees (100+ users)"],
                        ].map(([v, l]) => renderOption("companySize", v, l))] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "Do you have a dedicated IT team? *" }), [
                            ["Yes, a full IT team", "Yes, a full IT team"],
                            ["Yes, 1-2 IT personnel", "Yes, 1–2 IT personnel"],
                            ["No in-house IT team", "No in-house IT team"],
                        ].map(([v, l]) => renderOption("itTeam", v, l))] })] }),
        _jsxs("div", { children: [_jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "Where are your workloads currently hosted? *" }), [
                            ["Fully on-premise", "Fully on-premise"],
                            ["Hybrid (on-prem + cloud)", "Hybrid (on-prem + cloud)"],
                            ["Fully cloud", "Fully cloud"],
                            ["No structured infrastructure", "No structured infrastructure"],
                        ].map(([v, l]) => renderOption("infrastructure", v, l))] }), _jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "How would you describe the age of your infrastructure? *" }), [
                            ["Less than 2 years", "Less than 2 years"],
                            ["2-5 years", "2–5 years"],
                            ["More than 5 years", "More than 5 years"],
                            ["Not sure", "Not sure"],
                        ].map(([v, l]) => renderOption("infraAge", v, l))] }), _jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "What type of infrastructure do you use? *" }), [
                            ["Virtual machines", "Virtual machines"],
                            ["Containers (Docker/Kubernetes)", "Containers (Docker/Kubernetes)"],
                            ["Serverless", "Serverless"],
                            ["Not sure", "Not sure"],
                        ].map(([v, l]) => renderOption("infrastructureType", v, l))] }), _jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "How is your system availability today? *" }), [
                            ["Frequent downtime", "Frequent downtime"],
                            ["Occasional issues", "Occasional issues"],
                            ["Stable", "Stable"],
                            ["Highly available", "Highly available"],
                        ].map(([v, l]) => renderOption("systemAvailability", v, l))] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "Which Microsoft technologies are you currently using? *" }), [
                            ["Microsoft 365", "Microsoft 365"],
                            ["Windows Server", "Windows Server"],
                            ["Both", "Both"],
                            ["None", "None"],
                        ].map(([v, l]) => renderOption("microsoftProducts", v, l))] })] }),
        _jsxs("div", { children: [_jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "Which systems do you currently use? (select all that apply) *" }), ["ERP system", "CRM system", "Company website", "Email server", "File storage", "Custom-built applications"].map(v => renderMultiOption(v, v))] }), _jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "How critical is application downtime? *" }), [
                            ["Mission-critical (no downtime acceptable)", "Mission-critical (no downtime acceptable)"],
                            ["Moderate (a few hours acceptable)", "Moderate (a few hours acceptable)"],
                            ["Low impact", "Low impact"],
                        ].map(([v, l]) => renderOption("downtimeCriticality", v, l))] }), _jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "Are you planning to develop new applications? *" }), ["Yes", "No", "Not sure"].map(v => renderOption("newApps", v, v))] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "What is your peak usage pattern? *" }), [
                            ["Consistent", "Consistent — usage is steady throughout the year"],
                            ["Seasonal", "Seasonal — spikes at specific times of year"],
                            ["Unpredictable spikes", "Unpredictable spikes — sudden bursts of traffic"],
                            ["Not sure", "Not sure"],
                        ].map(([v, l]) => renderOption("peakUsage", v, l))] })] }),
        _jsxs("div", { children: [_jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "What type of sensitive data do you handle? *" }), [
                            ["None", "None"],
                            ["Personal data (PII)", "Personal data (PII)"],
                            ["Financial data", "Financial data"],
                            ["Health data", "Health data — patient records, medical info"],
                        ].map(([v, l]) => renderOption("sensitiveDataType", v, l))] }), _jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "Have you experienced any security incidents in the past 2 years? *" }), ["Yes", "No", "Prefer not to say"].map(v => renderOption("securityIncidents", v, v))] }), _jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "Do you have regulatory or compliance requirements? *" }), [
                            ["Yes (e.g., GDPR, ISO)", "Yes (e.g., GDPR, ISO)"],
                            ["No", "No"],
                            ["Not sure", "Not sure"],
                        ].map(([v, l]) => renderOption("compliance", v, l))] }), _jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "How do you currently manage access control? *" }), [
                            ["No formal system", "No formal system"],
                            ["Basic passwords", "Basic passwords only"],
                            ["Role-based access", "Role-based access control (RBAC)"],
                            ["Identity provider (Azure AD, etc.)", "Identity provider (Azure AD, Okta, etc.)"],
                        ].map(([v, l]) => renderOption("accessControl", v, l))] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "Do you have a backup or disaster recovery solution? *" }), [
                            ["Yes, fully implemented", "Yes, fully implemented"],
                            ["Partial solution", "Partial solution"],
                            ["No", "No"],
                            ["Not sure", "Not sure"],
                        ].map(([v, l]) => renderOption("backupSolution", v, l))] })] }),
        _jsxs("div", { children: [_jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "What is your estimated monthly budget for cloud services? *" }), [
                            ["Less than $500", "Less than $500"],
                            ["$500-$2000", "$500 – $2,000"],
                            ["$2000-$5000", "$2,000 – $5,000"],
                            ["More than $5000", "More than $5,000"],
                        ].map(([v, l]) => renderOption("budget", v, l))] }), _jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "When are you planning to start your cloud adoption journey? *" }), [
                            ["Immediately", "Immediately"],
                            ["Within 3 months", "Within 3 months"],
                            ["Within 6 months", "Within 6 months"],
                            ["Just exploring", "Just exploring"],
                        ].map(([v, l]) => renderOption("timeline", v, l))] }), _jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "What is your primary objective for moving to the cloud? *" }), [
                            ["Cost optimization", "Cost optimization"],
                            ["Security improvement", "Security improvement"],
                            ["Scalability", "Scalability"],
                            ["Remote work enablement", "Remote work enablement"],
                            ["All of the above", "All of the above"],
                        ].map(([v, l]) => renderOption("primaryGoal", v, l))] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }, children: "What matters most to your organization? *" }), [
                            ["Lowest cost", "Lowest cost — minimize cloud spend"],
                            ["Best performance", "Best performance — speed and reliability"],
                            ["Maximum security", "Maximum security — data protection first"],
                            ["Balanced", "Balanced — good mix of all factors"],
                        ].map(([v, l]) => renderOption("priority", v, l))] })] }),
    ];
    return (_jsxs("div", { style: { padding: "24px", maxWidth: "680px", margin: "0 auto" }, children: [_jsx("div", { style: { display: "flex", alignItems: "center", marginBottom: "24px" }, children: SECTIONS.map((section, index) => (_jsxs("div", { style: { display: "flex", alignItems: "center", flex: 1 }, children: [_jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }, children: [_jsx("div", { style: {
                                        width: "24px", height: "24px", borderRadius: "50%",
                                        background: index <= step ? "#185FA5" : "#e5e7eb",
                                        color: index <= step ? "#fff" : "#9ca3af",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "11px", fontWeight: 500, flexShrink: 0
                                    }, children: index < step ? "✓" : index + 1 }), _jsx("span", { style: {
                                        fontSize: "10px",
                                        color: index === step ? "#185FA5" : "#9ca3af",
                                        fontWeight: index === step ? 500 : 400,
                                        whiteSpace: "nowrap"
                                    }, children: section })] }), index < SECTIONS.length - 1 && (_jsx("div", { style: {
                                flex: 1, height: "1px",
                                background: index < step ? "#185FA5" : "#e5e7eb",
                                margin: "0 4px", marginBottom: "16px"
                            } }))] }, section))) }), _jsxs("div", { style: { marginBottom: "8px", fontSize: "12px", color: "#6b7280" }, children: ["Section ", step + 1, " of ", SECTIONS.length] }), _jsx("div", { style: { height: "4px", background: "#e5e7eb", borderRadius: "2px", marginBottom: "20px", overflow: "hidden" }, children: _jsx("div", { style: {
                        height: "100%", background: "#185FA5", borderRadius: "2px",
                        width: `${((step + 1) / SECTIONS.length) * 100}%`,
                        transition: "width 0.3s"
                    } }) }), _jsx("div", { style: { fontSize: "18px", fontWeight: 500, marginBottom: "4px" }, children: SECTIONS[step] }), _jsxs("div", { style: { fontSize: "13px", color: "#6b7280", marginBottom: "20px" }, children: [step === 0 && "Tell us about your company", step === 1 && "Tell us about your existing IT setup", step === 2 && "Tell us about your applications and workloads", step === 3 && "Tell us about your security and compliance", step === 4 && "Tell us about your budget and timeline"] }), _jsx(Card, { children: steps[step] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }, children: [_jsx(Button, { onClick: () => setStep((prev) => prev - 1), disabled: step === 0, children: "Back" }), step < SECTIONS.length - 1 ? (_jsx(Button, { variant: "primary", onClick: () => setStep((prev) => prev + 1), disabled: !isStepValid(), children: "Next" })) : (_jsx(Button, { variant: "primary", onClick: () => onSubmit(answers), disabled: !isStepValid() || loading, children: loading ? "Submitting..." : "Submit assessment" }))] })] }));
}
