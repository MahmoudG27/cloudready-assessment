import { AssessmentAnswers } from "../types/assessment";
import { RecommendedService } from "./recommendationRules";

// ===== Service Pricing Catalog =====
const SERVICE_PRICING: Record<string, { min: number; max: number }> = {
  // Compute
  "Azure App Service": { min: 50, max: 120 },
  "Azure Kubernetes Service (AKS)": { min: 200, max: 600 },
  "Azure Container Apps": { min: 50, max: 150 },
  "Azure Functions": { min: 10, max: 50 },
  "Azure Virtual Machines": { min: 100, max: 400 },

  // Data
  "Azure SQL Database": { min: 30, max: 200 },
  "Azure Cosmos DB": { min: 25, max: 150 },
  "Azure Blob Storage": { min: 10, max: 50 },

  // Security
  "Microsoft Defender for Cloud": { min: 15, max: 60 },
  "Microsoft Sentinel": { min: 100, max: 300 },
  "Azure Key Vault": { min: 5, max: 20 },
  "Microsoft Purview": { min: 50, max: 150 },

  // Identity
  "Azure Active Directory": { min: 6, max: 22 },

  // Operations
  "Azure Backup": { min: 10, max: 40 },
  "Azure Site Recovery": { min: 25, max: 80 },
  "Azure Migrate": { min: 0, max: 0 },
  "Azure Monitor": { min: 10, max: 40 },
  "Azure Cost Management + Budget Alerts": { min: 0, max: 0 },
  "Azure Autoscale": { min: 0, max: 0 },
  "Azure Front Door": { min: 35, max: 100 },
  "Azure CDN": { min: 10, max: 40 },
  "Microsoft 365 Exchange Online": { min: 4, max: 22 },
};

// ===== Multipliers =====
const SIZE_MULTIPLIER: Record<string, number> = {
  "1–10": 0.6,
  "11–50": 1.0,
  "51–200": 1.8,
  "200+": 3.5,
};

const PRIORITY_MULTIPLIER: Record<string, { min: number; max: number }> = {
  "lowest cost": { min: 0.8, max: 0.9 },
  "balanced": { min: 1.0, max: 1.0 },
  "best performance": { min: 1.1, max: 1.3 },
  "maximum security": { min: 1.2, max: 1.5 },
};

// ===== Main Function =====
function getSizeMultiplier(companySize: string): number {
  const size = companySize?.toLowerCase() ?? "";
  if (size.includes("200+") || size.includes("200 +")) return 3.5;
  if (size.includes("51") || size.includes("51–200")) return 1.8;
  if (size.includes("11") || size.includes("11–50")) return 1.0;
  return 0.6; // 1-10
}

export function calculatePricing(
  services: RecommendedService[],
  answers: AssessmentAnswers
): { min: number; max: number; notes: string } {

  let baseMin = 0;
  let baseMax = 0;
  const includedServices: string[] = [];

  // Sum up service costs
  services.forEach((svc) => {
    const pricing = SERVICE_PRICING[svc.service];
    if (pricing) {
      baseMin += pricing.min;
      baseMax += pricing.max;
      if (pricing.min > 0 || pricing.max > 0) {
        includedServices.push(svc.service);
      }
    }
  });

  // Apply size multiplier
  const sizeMultiplier = getSizeMultiplier(answers.companySize ?? "");

  baseMin = Math.round(baseMin * sizeMultiplier);
  baseMax = Math.round(baseMax * sizeMultiplier);

  // Apply priority multiplier
  const priorityKey = answers.priority?.toLowerCase() ?? "balanced";
  const priorityMult = PRIORITY_MULTIPLIER[priorityKey] ?? { min: 1.0, max: 1.0 };

  baseMin = Math.round(baseMin * priorityMult.min);
  baseMax = Math.round(baseMax * priorityMult.max);

  // Apply HA multiplier for mission-critical
  if (answers.downtimeCriticality?.toLowerCase().includes("mission-critical")) {
    baseMin = Math.round(baseMin * 1.2);
    baseMax = Math.round(baseMax * 1.4);
  }

  // Minimum floor
  baseMin = Math.max(baseMin, 100);
  baseMax = Math.max(baseMax, baseMin + 200);

  // Build notes
  const notes = [
    `Estimated based on ${includedServices.length} recommended Azure services`,
    `Company size multiplier: ${sizeMultiplier}x`,
    answers.priority ? `Priority: ${answers.priority}` : null,
    answers.downtimeCriticality?.toLowerCase().includes("mission-critical")
      ? "HA premium applied for mission-critical workloads"
      : null,
    "Actual costs vary based on usage, storage, and data transfer",
  ].filter(Boolean).join(". ");

  return { min: baseMin, max: baseMax, notes };
}