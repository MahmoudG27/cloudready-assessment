import axios from "axios";
import {
  ApiResponse,
  PaginatedResponse,
  AssessmentAnswers,
  AssessmentScore,
  AssessmentDocument,
} from "../types/assessment";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:7071/api";
const FUNCTION_KEY = import.meta.env.VITE_FUNCTION_KEY || "";
const USER_ID = import.meta.env.VITE_USER_ID || "anonymous";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-functions-key": FUNCTION_KEY,
    "x-user-id": USER_ID,
  },
});

// ===== Submit Assessment =====
export async function submitAssessment(
  companyName: string,
  answers: AssessmentAnswers,
  score: AssessmentScore
): Promise<ApiResponse<{ id: string; status: string }>> {
  const response = await api.post("/assessment", {
    companyName,
    answers,
    score,
  });
  return response.data;
}

// ===== Generate Report =====
export async function generateReport(
  id: string
): Promise<ApiResponse<{ id: string; status: string }>> {
  const response = await api.post(`/assessment/${id}/generate`);
  return response.data;
}

// ===== Get All Assessments =====
export async function getAssessments(): Promise<PaginatedResponse<Partial<AssessmentDocument>>> {
  const response = await api.get("/assessments");
  return response.data;
}

// ===== Get Single Assessment =====
export async function getAssessment(
  id: string
): Promise<ApiResponse<AssessmentDocument>> {
  const response = await api.get(`/assessment/${id}`);
  return response.data;
}

// ===== Get Report =====
export async function getReport(
  id: string
): Promise<ApiResponse<Partial<AssessmentDocument>>> {
  const response = await api.get(`/assessment/${id}/report`);
  return response.data;
}

// ===== Generate PDF =====
export async function generatePDF(
  id: string
): Promise<ApiResponse<{ id: string; pdfUrl: string }>> {
  const response = await api.post(`/assessment/${id}/pdf`);
  return response.data;
}

// ===== Get PDF URL =====
export async function getPdfUrl(
  id: string
): Promise<ApiResponse<{ id: string; sasUrl: string }>> {
  const response = await api.get(`/assessment/${id}/pdf-url`);
  return response.data;
}

// ===== Send Report by Email =====
export async function sendReport(
  id: string,
  email: string
): Promise<ApiResponse<{ id: string; sentTo: string }>> {
  const response = await api.post(`/assessment/${id}/send`, { email });
  return response.data;
}