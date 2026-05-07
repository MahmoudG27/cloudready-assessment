import { AssessmentAnswers, AssessmentScore } from "../types/assessment";

export function calculateScore(answers: AssessmentAnswers): AssessmentScore {
  let infrastructure = 0;
  let security = 0;
  let teamReadiness = 0;

  // ===== Infrastructure (40%) =====
  const infraMap: Record<string, number> = {
    "fully cloud": 100,
    "hybrid (on-prem + cloud)": 80,
    "fully on-premise": 30,
    "no structured infrastructure": 50,
  };
  infrastructure += infraMap[answers.infrastructure.toLowerCase()] ?? 40;

  const infraTypeMap: Record<string, number> = {
    "containers (docker/kubernetes)": 100,
    "serverless": 90,
    "virtual machines": 60,
    "not sure": 30,
  };
  infrastructure += infraTypeMap[answers.infrastructureType?.toLowerCase() ?? ""] ?? 30;

  const ageMap: Record<string, number> = {
    "less than 2 years": 100,
    "2-5 years": 70,
    "more than 5 years": 30,
    "not sure": 40,
  };
  infrastructure += ageMap[answers.infraAge.toLowerCase()] ?? 40;

  const availabilityMap: Record<string, number> = {
    "highly available": 100,
    "stable": 70,
    "occasional issues": 40,
    "frequent downtime": 10,
  };
  infrastructure += availabilityMap[answers.systemAvailability?.toLowerCase() ?? ""] ?? 40;

  const msMap: Record<string, number> = {
    "both": 100,
    "microsoft 365": 80,
    "windows server": 60,
    "none": 20,
  };
  infrastructure += msMap[answers.microsoftProducts.toLowerCase()] ?? 40;

  const backupMap: Record<string, number> = {
    "yes, fully implemented": 100,
    "partial solution": 60,
    "no": 0,
    "not sure": 20,
  };
  infrastructure += backupMap[answers.backupSolution.toLowerCase()] ?? 20;

  infrastructure = Math.round(infrastructure / 6);

  // ===== Security (35%) =====
  const dataTypeMap: Record<string, number> = {
    "none": 100,
    "personal data (pii)": 40,
    "financial data": 30,
    "health data": 20,
  };
  security += dataTypeMap[answers.sensitiveDataType?.toLowerCase() ?? ""] ?? 50;

  const incidentsMap: Record<string, number> = {
    "no": 100,
    "prefer not to say": 50,
    "yes": 10,
  };
  security += incidentsMap[answers.securityIncidents.toLowerCase()] ?? 50;

  const complianceMap: Record<string, number> = {
    "yes (e.g., gdpr, iso)": 80,
    "no": 60,
    "not sure": 40,
  };
  security += complianceMap[answers.compliance.toLowerCase()] ?? 40;

  const accessMap: Record<string, number> = {
    "identity provider (azure ad, etc.)": 100,
    "role-based access": 70,
    "basic passwords": 30,
    "no formal system": 0,
  };
  security += accessMap[answers.accessControl?.toLowerCase() ?? ""] ?? 30;

  security = Math.round(security / 4);

  // ===== Team Readiness (25%) =====
  const itTeamMap: Record<string, number> = {
    "yes, a full it team": 100,
    "yes, 1-2 it personnel": 60,
    "no in-house it team": 10,
  };
  teamReadiness += itTeamMap[answers.itTeam.toLowerCase()] ?? 40;

  const newAppsMap: Record<string, number> = {
    "yes": 80,
    "not sure": 50,
    "no": 30,
  };
  teamReadiness += newAppsMap[answers.newApps.toLowerCase()] ?? 40;

  const priorityMap: Record<string, number> = {
    "maximum security": 90,
    "balanced": 80,
    "best performance": 70,
    "lowest cost": 50,
  };
  teamReadiness += priorityMap[answers.priority?.toLowerCase() ?? ""] ?? 60;

  teamReadiness = Math.round(teamReadiness / 3);

  // ===== Conditional Penalties =====

  // Health data + no IAM
  if (
    answers.sensitiveDataType?.toLowerCase() === "health data" &&
    answers.accessControl?.toLowerCase() === "no formal system"
  ) {
    security = Math.min(security, 35);
  }

  // Financial data + security incidents
  if (
    answers.sensitiveDataType?.toLowerCase() === "financial data" &&
    answers.securityIncidents?.toLowerCase() === "yes"
  ) {
    security = Math.min(security, 25);
  }

  // No backup + mission critical
  if (
    answers.backupSolution?.toLowerCase() === "no" &&
    answers.downtimeCriticality?.toLowerCase().includes("mission-critical")
  ) {
    infrastructure = Math.min(infrastructure, 40);
  }

  // Frequent downtime + old infrastructure
  if (
    answers.systemAvailability?.toLowerCase() === "frequent downtime" &&
    answers.infraAge?.toLowerCase() === "more than 5 years"
  ) {
    infrastructure = Math.min(infrastructure, 30);
  }

  // No IAM + any sensitive data
  if (
    answers.accessControl?.toLowerCase() === "no formal system" &&
    answers.sensitiveDataType?.toLowerCase() !== "none"
  ) {
    security = Math.min(security, 45);
  }

  // Security incidents + no compliance
  if (
    answers.securityIncidents?.toLowerCase() === "yes" &&
    answers.compliance?.toLowerCase() === "no"
  ) {
    security = Math.min(security, 30);
  }

  // No IT team + containers
  if (
    answers.itTeam?.toLowerCase() === "no in-house it team" &&
    answers.infrastructureType?.toLowerCase().includes("containers")
  ) {
    teamReadiness = Math.min(teamReadiness, 25);
  }

  // ===== Total =====
  const total = Math.round(
    infrastructure * 0.4 +
    security * 0.35 +
    teamReadiness * 0.25
  );

  return { total, infrastructure, security, teamReadiness };
}

export function calculateConfidence(answers: AssessmentAnswers): number {
  let confidence = 95;

  // كل "not sure" بيقلل الـ confidence
  const notSureFields = [
    answers.infrastructureType,
    answers.systemAvailability,
    answers.compliance,
    answers.infraAge,
    answers.backupSolution,
  ];

  const notSureCount = notSureFields.filter(
    (a) => a?.toLowerCase().includes("not sure")
  ).length;

  confidence -= notSureCount * 8;

  // لو مفيش IT team — data quality أقل
  if (answers.itTeam?.toLowerCase() === "no in-house it team") {
    confidence -= 5;
  }

  // لو industry = Other — context أقل
  if (answers.industry?.toLowerCase() === "other") {
    confidence -= 5;
  }

  // لو prefer not to say في security incidents
  if (answers.securityIncidents?.toLowerCase() === "prefer not to say") {
    confidence -= 8;
  }

  // لو budget = not defined
  if (answers.budget?.toLowerCase()?.includes("not defined")) {
    confidence -= 5;
  }

  // مينزلش تحت 40%
  return Math.max(confidence, 40);
}