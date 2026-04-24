import axios from "axios";
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
export async function submitAssessment(companyName, answers, score) {
    const response = await api.post("/assessment", {
        companyName,
        answers,
        score,
    });
    return response.data;
}
// ===== Generate Report =====
export async function generateReport(id) {
    const response = await api.post(`/assessment/${id}/generate`);
    return response.data;
}
// ===== Get All Assessments =====
export async function getAssessments() {
    const response = await api.get("/assessments");
    return response.data;
}
// ===== Get Single Assessment =====
export async function getAssessment(id) {
    const response = await api.get(`/assessment/${id}`);
    return response.data;
}
// ===== Get Report =====
export async function getReport(id) {
    const response = await api.get(`/assessment/${id}/report`);
    return response.data;
}
// ===== Generate PDF =====
export async function generatePDF(id) {
    const response = await api.post(`/assessment/${id}/pdf`);
    return response.data;
}
// ===== Get PDF URL =====
export async function getPdfUrl(id) {
    const response = await api.get(`/assessment/${id}/pdf-url`);
    return response.data;
}
// ===== Send Report by Email =====
export async function sendReport(id, email) {
    const response = await api.post(`/assessment/${id}/send`, { email });
    return response.data;
}
