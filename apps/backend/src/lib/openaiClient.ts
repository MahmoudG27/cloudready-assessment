import OpenAI from "openai/index.mjs";
import { ReportData } from "../types/assessment";
import { RulesOutput } from "./recommendationRules";

if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
if (!process.env.OPENAI_ENDPOINT) throw new Error("Missing OPENAI_ENDPOINT");
if (!process.env.OPENAI_DEPLOYMENT_NAME) throw new Error("Missing OPENAI_DEPLOYMENT_NAME");
if (!process.env.SYSTEM_PROMPT) throw new Error("Missing SYSTEM_PROMPT");

const endpoint = process.env.OPENAI_ENDPOINT.endsWith("/")
  ? process.env.OPENAI_ENDPOINT
  : `${process.env.OPENAI_ENDPOINT}/`;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: `${endpoint}openai/deployments/${process.env.OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: { "api-version": "2024-08-01-preview" },
  defaultHeaders: { "api-key": process.env.OPENAI_API_KEY },
});

// ===== Schema Validation =====
function validateReportSchema(data: any): data is ReportData {
  return (
    data?.companyOverview &&
    data?.readinessScore &&
    data?.keyFindings &&
    Array.isArray(data?.keyFindings) &&
    data?.riskAssessment &&
    Array.isArray(data?.riskAssessment) &&
    data?.recommendedServices &&
    Array.isArray(data?.recommendedServices) &&
    data?.migrationRoadmap &&
    Array.isArray(data?.migrationRoadmap) &&
    data?.estimatedMonthlyCost
  );
}

// ===== Industry-Specific Context =====
function getIndustryContext(industry: string): string {
  const contexts: Record<string, string> = {
    healthcare: `
HEALTHCARE INDUSTRY CONTEXT:
- Patient data protection is paramount — recommend Azure Health Data Services and HIPAA-compliant configurations
- Emphasize Microsoft Defender for Cloud with healthcare compliance policies
- Data residency matters — recommend Azure regions with healthcare compliance (UAE North for MENA)
- Recommend Azure API for FHIR for health data interoperability
- Stress business continuity — downtime directly impacts patient care
- Compliance frameworks: HIPAA, ISO 27001, local health data regulations`,

    "financial services": `
FINANCIAL SERVICES INDUSTRY CONTEXT:
- PCI-DSS compliance is critical — recommend Azure Payment HSM and encrypted storage
- Emphasize zero-trust security architecture
- Recommend Azure Confidential Computing for sensitive financial processing
- High availability is non-negotiable — recommend multi-region active-active setup
- Stress fraud detection capabilities — Azure AI and anomaly detection
- Compliance frameworks: PCI-DSS, SOC 2, local financial regulations`,

    "retail / e-commerce": `
RETAIL / E-COMMERCE INDUSTRY CONTEXT:
- Seasonal scaling is critical — emphasize Azure Autoscale and CDN
- Recommend Azure Front Door for global load balancing during peak seasons
- E-commerce uptime directly impacts revenue — stress SLA requirements
- Recommend Azure Cache for Redis for cart and session management
- Payment processing security — PCI-DSS compliance
- Inventory and order management — Azure SQL with high availability`,

    manufacturing: `
MANUFACTURING INDUSTRY CONTEXT:
- IoT integration is likely — recommend Azure IoT Hub and Edge computing
- OT/IT convergence considerations — Azure Defender for IoT
- Supply chain visibility — Azure Digital Twins
- Predictive maintenance opportunities — Azure Machine Learning
- Legacy system integration — recommend hybrid connectivity with Azure Arc
- Compliance: ISO 27001, industry-specific certifications`,

    "saas / tech": `
SAAS / TECH INDUSTRY CONTEXT:
- Developer velocity is key — recommend Azure DevOps and GitHub Actions
- Multi-tenant architecture considerations — Azure AD B2C for customer identity
- Recommend Kubernetes (AKS) for containerized workloads
- API management — Azure API Management for product APIs
- Cost optimization at scale — Azure Reserved Instances and Savings Plans
- Compliance: SOC 2, ISO 27001, GDPR`,
  };

  const key = industry.toLowerCase();
  return contexts[key] ?? `
GENERAL INDUSTRY CONTEXT:
- Focus on foundational cloud best practices
- Recommend Azure Well-Architected Framework pillars
- Balance cost, performance, security, and reliability`;
}

// ===== Priority-Specific Guidance =====
function getPriorityGuidance(priority: string): string {
  const guidance: Record<string, string> = {
    "lowest cost": `
COST OPTIMIZATION PRIORITY:
- Recommend Azure Reserved Instances and Savings Plans
- Emphasize serverless and consumption-based services
- Suggest right-sizing and auto-shutdown for dev environments
- Recommend Azure Cost Management + Budget Alerts
- Prioritize PaaS over IaaS to reduce management overhead`,

    "best performance": `
PERFORMANCE PRIORITY:
- Recommend Premium storage tiers and SSD-based options
- Emphasize Azure CDN and Front Door for low latency
- Suggest Azure Cache for Redis for data caching
- Recommend proximity placement groups for latency-sensitive workloads
- Emphasize autoscaling and load balancing`,

    "maximum security": `
SECURITY-FIRST PRIORITY:
- Recommend Zero Trust architecture
- Emphasize Microsoft Defender for Cloud at highest tier
- Suggest Azure Sentinel for SIEM capabilities
- Recommend Private Endpoints for all services
- Emphasize encryption at rest and in transit
- Suggest regular penetration testing and security assessments`,

    "balanced": `
BALANCED APPROACH PRIORITY:
- Follow Azure Well-Architected Framework for all 5 pillars
- Balance cost optimization with performance requirements
- Implement security baseline without over-engineering
- Recommend phased approach to avoid big-bang migration`,
  };

  return guidance[priority.toLowerCase()] ?? guidance["balanced"];
}

// ===== Generate Report =====
export async function generateReportFromAI(
  answers: object,
  score: object,
  rules: RulesOutput
): Promise<object> {
  const a = answers as any;

  const industryContext = getIndustryContext(a.industry ?? "");
  const priorityGuidance = getPriorityGuidance(a.priority ?? "balanced");

  const systemPrompt = process.env.SYSTEM_PROMPT! + industryContext + priorityGuidance;
  const userPrompt = buildUserPrompt(answers, score, rules);

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_DEPLOYMENT_NAME!,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 4000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("Empty response from OpenAI");

  try {
    let cleaned = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    cleaned = cleaned.replace(
      /("cloudMaturityPosition"\s*:\s*"[^"]*")\s*\n\s*\}\s*,/g,
      '$1,'
    );

    const parsed = JSON.parse(cleaned);

    if (!validateReportSchema(parsed)) {
      throw new Error("AI response does not match required schema");
    }

    // Force override score
    const s = score as {
      total: number;
      infrastructure: number;
      security: number;
      teamReadiness: number;
    };

    parsed.readinessScore = {
      total: s.total,
      level: s.total >= 71 ? "Advanced" : s.total >= 41 ? "Developing" : "Beginner",
      breakdown: {
        infrastructure: s.infrastructure,
        security: s.security,
        teamReadiness: s.teamReadiness
      }
    };

    return parsed;

  } catch (e) {
    console.log("Raw content:", content);
    console.log("Parse error:", e);
    throw new Error(`Invalid JSON from AI: ${content.substring(0, 200)}`);
  }
}

// ===== Build User Prompt =====
function buildUserPrompt(answers: object, score: object, rules: RulesOutput): string {
  const s = score as {
    total: number;
    infrastructure: number;
    security: number;
    teamReadiness: number;
  };
  const a = answers as any;

  return `Generate a Cloud Readiness Report based on the following data.

Assessment Answers:
${JSON.stringify(answers, null, 2)}

KEY CONTEXT FOR THIS REPORT:
- Industry: ${a.industry}
- Infrastructure Type: ${a.infrastructureType ?? "not specified"}
- System Availability: ${a.systemAvailability ?? "not specified"}
- Peak Usage Pattern: ${a.peakUsage ?? "not specified"}
- Sensitive Data Type: ${a.sensitiveDataType ?? a.sensitiveData ?? "not specified"}
- Access Control: ${a.accessControl ?? "not specified"}
- Organization Priority: ${a.priority ?? "balanced"}

IMPORTANT - USE THESE EXACT SCORES:
Readiness Score: ${s.total}/100
Score Breakdown:
- Infrastructure: ${s.infrastructure}%
- Security: ${s.security}%
- Team Readiness: ${s.teamReadiness}%

YOU MUST USE THESE EXACT SCORES IN YOUR JSON RESPONSE:
"readinessScore": {
  "total": ${s.total},
  "level": "${s.total >= 71 ? "Advanced" : s.total >= 41 ? "Developing" : "Beginner"}",
  "breakdown": {
    "infrastructure": ${s.infrastructure},
    "security": ${s.security},
    "teamReadiness": ${s.teamReadiness}
  }
}

DETERMINISTIC RECOMMENDATIONS (you MUST include these services):
${rules.recommendedServices.map(s => `- ${s.service}: ${s.reason}`).join("\n")}

ARCHITECTURE RULES (use these as foundation):
${rules.architectureSuggestions.map(a => `- [${a.layer}] ${a.component} → ${a.azureService}: ${a.reason}`).join("\n")}

MIGRATION WARNINGS (include these in risk assessment):
${rules.migrationWarnings.length > 0
  ? rules.migrationWarnings.map(w => `- ${w}`).join("\n")
  : "- No critical warnings detected"}

IMPORTANT: The services listed above are determined by business rules.
Include ALL of them in your recommendedServices array.
You may add additional services if context warrants it.

IMPORTANT CONSTRAINTS:
- keyFindings: 3 to 5 items only
- riskAssessment: 3 to 5 items only
- recommendedServices: 3 to 6 services only
- migrationRoadmap: exactly 3 phases
- nextSteps: 3 to 5 actionable steps — each must reference KlayyTech

COST ESTIMATION RULES:
- Small (1-50 employees): $300-$800/month
- Medium (51-200 employees): $800-$2,000/month
- Large (200+): $2,000-$5,000+/month
- Always return min and max as separate numbers
- List assumptions in notes field

FALLBACK RULES:
- If data is insufficient, return "insufficient data" in that field
- Do not guess or fabricate data

CRITICAL: Return ONLY valid JSON. No markdown, no extra text.
IMPORTANT: nextSteps must be an array of plain strings.

YOU MUST RETURN EXACTLY THIS JSON STRUCTURE:
{
  "companyOverview": {
    "industry": "",
    "companySize": "",
    "itMaturityLevel": "Low | Medium | High",
    "itMaturityReason": ""
  },
  "readinessScore": {
    "total": 0,
    "level": "Beginner | Developing | Advanced",
    "breakdown": {
      "infrastructure": 0,
      "security": 0,
      "teamReadiness": 0
    }
  },
  "cloudMaturityPosition": "",
  "keyFindings": [
    {
      "type": "risk | strength",
      "severity": "high | medium | low",
      "text": ""
    }
  ],
  "riskAssessment": [
    {
      "level": "High | Medium | Low",
      "risk": "",
      "businessImpact": "",
      "mitigation": ""
    }
  ],
  "recommendedServices": [
    {
      "service": "",
      "outcome": "",
      "whyItFits": "",
      "useCase": ""
    }
  ],
  "architectureSuggestion": [
    {
      "layer": "App | Data | Security",
      "component": "",
      "azureService": ""
    }
  ],
  "migrationRoadmap": [
    {
      "phase": "",
      "title": "",
      "activities": [],
      "estimatedDuration": ""
    }
  ],
  "estimatedMonthlyCost": {
    "min": 0,
    "max": 0,
    "currency": "USD",
    "notes": ""
  },
  "nextSteps": []
}`;
}