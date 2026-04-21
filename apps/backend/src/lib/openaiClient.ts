import OpenAI from "openai";
import { ReportData } from "../types/assessment";

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

// ===== Generate Report =====
export async function generateReportFromAI(
  answers: object,
  score: object
): Promise<object> {
  const systemPrompt = process.env.SYSTEM_PROMPT!;
  const userPrompt = buildUserPrompt(answers, score);

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
    const cleaned = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!validateReportSchema(parsed)) {
      throw new Error("AI response does not match required schema");
    }

    return parsed;

  } catch (e) {
    console.log("Raw content:", content);
    console.log("Parse error:", e);
    throw new Error(`Invalid JSON from AI: ${content.substring(0, 200)}`);
  }
}

// ===== Build User Prompt =====
function buildUserPrompt(answers: object, score: object): string {
  const s = score as {
    total: number;
    infrastructure: number;
    security: number;
    teamReadiness: number;
  };

  return `Generate a Cloud Readiness Report based on the following data.

Assessment Answers:
${JSON.stringify(answers, null, 2)}

Readiness Score: ${s.total}/100
Score Breakdown:
- Infrastructure: ${s.infrastructure}%
- Security: ${s.security}%
- Team Readiness: ${s.teamReadiness}%

IMPORTANT CONSTRAINTS:
- keyFindings: 3 to 5 items only
- riskAssessment: 3 to 5 items only
- recommendedServices: 3 to 6 services only
- migrationRoadmap: exactly 3 phases
- nextSteps: 3 to 5 actionable steps

COST ESTIMATION RULES:
- Small (1-50 employees): $300-$800/month
- Medium (51-200 employees): $800-$2,000/month
- Large (200+): $2,000-$5,000+/month
- Always return min and max as separate numbers
- List assumptions in notes field

FALLBACK RULES:
- If data is insufficient, return "insufficient data" in that field
- Do not guess or fabricate data

YOU MUST RETURN EXACTLY THIS JSON STRUCTURE — NO DEVIATIONS:
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