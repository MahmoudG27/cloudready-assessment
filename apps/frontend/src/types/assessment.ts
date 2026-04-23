export type AssessmentStatus = "draft" | "generating" | "completed" | "failed";
export type ITMaturityLevel = "Low" | "Medium" | "High";
export type ReadinessLevel = "Beginner" | "Developing" | "Advanced";
export type RiskLevel = "High" | "Medium" | "Low";
export type FindingType = "risk" | "strength";
export type FindingSeverity = "high" | "medium" | "low";
export type ArchitectureLayer = "App" | "Data" | "Security";

export interface AssessmentAnswers {
  industry: string;
  companySize: string;
  itTeam: string;
  infrastructure: string;
  infraAge: string;
  microsoftProducts: string;
  systems: string[];
  downtimeCriticality: string;
  newApps: string;
  sensitiveData: string;
  securityIncidents: string;
  compliance: string;
  budget: string;
  timeline: string;
  primaryGoal: string;
  backupSolution: string;
}

export interface AssessmentScore {
  total: number;
  infrastructure: number;
  security: number;
  teamReadiness: number;
}

export interface AssessmentDocument {
  id: string;
  userId: string;
  companyName: string;
  createdAt: string;
  updatedAt: string;
  status: AssessmentStatus;
  meta: {
    aiModel: string;
    promptVersion: string;
    generatedAt: string | null;
    confidenceScore: number | null;
  };
  answers: AssessmentAnswers;
  insights: {
    topRisk: string;
    topOpportunity: string;
    priority: string;
    level: ReadinessLevel;
  };
  report: {
    data: ReportData | null;
    ui: ReportUI | null;
  };
  usage: {
    viewed: boolean;
    viewedAt: string | null;
    shared: boolean;
  };
  pdfUrl: string | null;
  sharedLink: string | null;
}

export interface ReportData {
  companyOverview: {
    industry: string;
    companySize: string;
    itMaturityLevel: ITMaturityLevel;
    itMaturityReason: string;
  };
  readinessScore: {
    total: number;
    level: ReadinessLevel;
    breakdown: {
      infrastructure: number;
      security: number;
      teamReadiness: number;
    };
  };
  cloudMaturityPosition: string;
  keyFindings: {
    type: FindingType;
    severity: FindingSeverity;
    text: string;
  }[];
  riskAssessment: {
    level: RiskLevel;
    risk: string;
    businessImpact: string;
    mitigation: string;
  }[];
  recommendedServices: {
    service: string;
    outcome: string;
    whyItFits: string;
    useCase: string;
  }[];
  architectureSuggestion: {
    layer: ArchitectureLayer;
    component: string;
    azureService: string;
  }[];
  migrationRoadmap: {
    phase: string;
    title: string;
    activities: string[];
    estimatedDuration: string;
  }[];
  estimatedMonthlyCost: {
    min: number;
    max: number;
    currency: string;
    notes: string;
  };
  nextSteps: string[];
}

export interface ReportUI {
  hero: {
    verdict: string;
    subtext: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  highlights: string[];
  labels: {
    scoreLevel: string;
    topRiskBadge: string;
    industryBenchmark: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  error: string | null;
}