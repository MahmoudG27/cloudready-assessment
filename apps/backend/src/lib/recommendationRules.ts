import { AssessmentAnswers } from "../types/assessment";

export interface RecommendedService {
  service: string;
  reason: string;
  priority: "critical" | "high" | "medium";
}

export interface ArchitectureRule {
  layer: "App" | "Data" | "Security";
  component: string;
  azureService: string;
  reason: string;
}

export interface RulesOutput {
  recommendedServices: RecommendedService[];
  architectureSuggestions: ArchitectureRule[];
  migrationWarnings: string[];
}

export function applyRecommendationRules(answers: AssessmentAnswers): RulesOutput {
  const services: RecommendedService[] = [];
  const architecture: ArchitectureRule[] = [];
  const warnings: string[] = [];

  // ===== Infrastructure Rules =====

  // Containers → AKS vs Container Apps (smart decision)
  if (answers.infrastructureType?.toLowerCase().includes("containers")) {
    const hasDevOps = answers.itTeam?.toLowerCase() === "yes, a full it team";
    const isBigCompany = answers.companySize?.includes("200+") ||
      answers.companySize?.includes("51–200");

    if (hasDevOps && isBigCompany) {
      services.push({
        service: "Azure Kubernetes Service (AKS)",
        reason: "Your team has IT maturity and scale to leverage full Kubernetes orchestration",
        priority: "high"
      });
      architecture.push({
        layer: "App",
        component: "Containerized workloads",
        azureService: "Azure Kubernetes Service (AKS)",
        reason: "Full container orchestration for mature DevOps teams"
      });
    } else {
      services.push({
        service: "Azure Container Apps",
        reason: "Managed containers without Kubernetes complexity — better fit for your team size",
        priority: "high"
      });
      architecture.push({
        layer: "App",
        component: "Containerized workloads",
        azureService: "Azure Container Apps",
        reason: "Serverless containers — no Kubernetes overhead for smaller teams"
      });
      warnings.push("AKS may be overkill for your current team size — Azure Container Apps recommended instead");
    }
  }

  // Serverless → Azure Functions
  if (answers.infrastructureType?.toLowerCase() === "serverless") {
    services.push({
      service: "Azure Functions",
      reason: "Your serverless infrastructure maps directly to Azure Functions consumption model",
      priority: "high"
    });
    architecture.push({
      layer: "App",
      component: "Serverless workloads",
      azureService: "Azure Functions",
      reason: "Native serverless with pay-per-execution pricing"
    });
  }

  // VMs → Azure Virtual Machines or App Service
  if (answers.infrastructureType?.toLowerCase() === "virtual machines") {
    services.push({
      service: "Azure Virtual Machines",
      reason: "Direct lift-and-shift path for your existing VM workloads",
      priority: "medium"
    });
    architecture.push({
      layer: "App",
      component: "VM workloads",
      azureService: "Azure Virtual Machines",
      reason: "Lift-and-shift migration with minimal refactoring"
    });
  }

  // No backup + mission critical → Azure Backup (critical)
  if (
    answers.backupSolution?.toLowerCase() === "no" &&
    answers.downtimeCriticality?.toLowerCase().includes("mission-critical")
  ) {
    services.push({
      service: "Azure Backup",
      reason: "CRITICAL: No backup solution detected for mission-critical workloads — immediate action required",
      priority: "critical"
    });
    architecture.push({
      layer: "Security",
      component: "Backup & disaster recovery",
      azureService: "Azure Backup + Site Recovery",
      reason: "Critical gap — no backup for mission-critical systems"
    });
    warnings.push("No backup solution for mission-critical workloads — this is your highest risk item");
  }

  // Old infrastructure → Azure Migrate
  if (answers.infraAge?.toLowerCase() === "more than 5 years") {
    services.push({
      service: "Azure Migrate",
      reason: "Aging infrastructure needs structured assessment before migration — Azure Migrate provides free discovery",
      priority: "high"
    });
    warnings.push("Infrastructure over 5 years old — recommend Azure Migrate assessment before any migration");
  }

  // Frequent downtime → Azure Site Recovery
  if (answers.systemAvailability?.toLowerCase() === "frequent downtime") {
    services.push({
      service: "Azure Site Recovery",
      reason: "Current instability requires disaster recovery capabilities during migration",
      priority: "critical"
    });
    warnings.push("Frequent downtime detected — phased migration with rollback plan strongly recommended");
  }

  // Seasonal peaks → Autoscale
  if (answers.peakUsage?.toLowerCase() === "seasonal") {
    services.push({
      service: "Azure Autoscale",
      reason: "Seasonal usage patterns require dynamic scaling to avoid over-provisioning costs",
      priority: "high"
    });
  }

  // Unpredictable spikes → Azure Front Door + Autoscale
  if (answers.peakUsage?.toLowerCase().includes("unpredictable")) {
    services.push({
      service: "Azure Front Door",
      reason: "Unpredictable traffic spikes require global load balancing and CDN capabilities",
      priority: "high"
    });
    services.push({
      service: "Azure Autoscale",
      reason: "Automatic scaling to handle sudden traffic bursts without manual intervention",
      priority: "high"
    });
  }

  // ===== Security Rules =====

  // Health data → Defender for Cloud + specific services
  if (answers.sensitiveDataType?.toLowerCase() === "health data") {
    services.push({
      service: "Microsoft Defender for Cloud",
      reason: "Health data requires continuous compliance monitoring and threat detection — HIPAA alignment",
      priority: "critical"
    });
    architecture.push({
      layer: "Security",
      component: "Health data compliance",
      azureService: "Microsoft Defender for Cloud",
      reason: "HIPAA-aligned security posture for patient data"
    });
    warnings.push("Health data detected — HIPAA-equivalent controls and data residency compliance required");
  }

  // Financial data → Azure Key Vault + Defender
  if (answers.sensitiveDataType?.toLowerCase() === "financial data") {
    services.push({
      service: "Azure Key Vault",
      reason: "Financial data requires hardware-backed key management and secrets protection",
      priority: "critical"
    });
    services.push({
      service: "Microsoft Defender for Cloud",
      reason: "PCI-DSS compliance monitoring for financial data workloads",
      priority: "critical"
    });
    warnings.push("Financial data detected — PCI-DSS compliance assessment recommended before migration");
  }

  // PII data → Azure Purview
  if (answers.sensitiveDataType?.toLowerCase().includes("pii")) {
    services.push({
      service: "Microsoft Purview",
      reason: "PII data governance and GDPR compliance require data cataloging and classification",
      priority: "high"
    });
    warnings.push("PII data detected — GDPR data mapping and subject rights processes required");
  }

  // No IAM → Azure AD
  if (
    answers.accessControl?.toLowerCase() === "no formal system" ||
    answers.accessControl?.toLowerCase() === "basic passwords"
  ) {
    services.push({
      service: "Azure Active Directory",
      reason: "Immediate identity foundation required — current access control is a critical security gap",
      priority: "critical"
    });
    architecture.push({
      layer: "Security",
      component: "Identity & access management",
      azureService: "Azure Active Directory",
      reason: "Foundation for all Azure security — must be first step"
    });
    warnings.push("No formal IAM detected — Azure AD setup must happen before any data migration");
  }

  // Has RBAC → Azure AD + Conditional Access
  if (answers.accessControl?.toLowerCase() === "role-based access") {
    services.push({
      service: "Azure Active Directory",
      reason: "Extend your existing RBAC model to cloud resources with Azure AD groups and roles",
      priority: "high"
    });
  }

  // Security incidents → Sentinel
  if (answers.securityIncidents?.toLowerCase() === "yes") {
    services.push({
      service: "Microsoft Sentinel",
      reason: "Previous security incidents indicate need for SIEM and advanced threat detection",
      priority: "critical"
    });
    warnings.push("Security incidents reported — security assessment required before migration");
  }

  // ===== Priority Rules =====

  // Cost priority → Cost Management
  if (answers.priority?.toLowerCase() === "lowest cost") {
    services.push({
      service: "Azure Cost Management + Budget Alerts",
      reason: "Cost optimization is your priority — automated budget controls and spending alerts",
      priority: "high"
    });
  }

  // Security priority → Zero Trust
  if (answers.priority?.toLowerCase() === "maximum security") {
    services.push({
      service: "Microsoft Defender for Cloud",
      reason: "Security-first approach requires unified cloud security posture management",
      priority: "high"
    });
    warnings.push("Maximum security priority — recommend Zero Trust architecture assessment");
  }

  // Performance priority → Premium services
  if (answers.priority?.toLowerCase() === "best performance") {
    services.push({
      service: "Azure CDN",
      reason: "Performance priority requires content delivery optimization for global users",
      priority: "medium"
    });
  }

  // ===== Data Layer Rules =====

  // ERP system → Azure SQL
  if (answers.systems?.includes("ERP system")) {
    architecture.push({
      layer: "Data",
      component: "ERP database",
      azureService: "Azure SQL Database",
      reason: "Managed relational database for ERP workloads with built-in HA"
    });
  }

  // File storage → Blob Storage
  if (answers.systems?.includes("File storage")) {
    architecture.push({
      layer: "Data",
      component: "File storage",
      azureService: "Azure Blob Storage",
      reason: "Scalable object storage for unstructured files"
    });
  }

  // Email server → Exchange Online
  if (answers.systems?.includes("Email server")) {
    architecture.push({
      layer: "App",
      component: "Email server",
      azureService: "Microsoft 365 Exchange Online",
      reason: "Migrate on-premise email to managed cloud service"
    });
  }

  // De-duplicate services by name
  const uniqueServices = services.filter(
    (svc, index, self) =>
      index === self.findIndex((s) => s.service === svc.service)
  );

  // Sort by priority: critical first
  const priorityOrder = { critical: 0, high: 1, medium: 2 };
  uniqueServices.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return {
    recommendedServices: uniqueServices,
    architectureSuggestions: architecture,
    migrationWarnings: warnings,
  };
}