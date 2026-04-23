import { useState } from "react";
import {
  submitAssessment,
  generateReport,
  getReport,
  generatePDF,
  getPdfUrl,
  sendReport,
} from "../services/api";
import {
  AssessmentAnswers,
  AssessmentScore,
  AssessmentDocument,
} from "../types/assessment";

interface UseAssessmentState {
  loading: boolean;
  error: string | null;
  assessmentId: string | null;
  report: Partial<AssessmentDocument> | null;
  pdfUrl: string | null;
}

export function useAssessment() {
  const [state, setState] = useState<UseAssessmentState>({
    loading: false,
    error: null,
    assessmentId: null,
    report: null,
    pdfUrl: null,
  });

  // ===== Submit Assessment =====
  async function submit(
    companyName: string,
    answers: AssessmentAnswers,
    score: AssessmentScore
  ): Promise<string | null> {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await submitAssessment(companyName, answers, score);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to submit assessment");
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        assessmentId: response.data!.id,
      }));

      return response.data.id;

    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
      return null;
    }
  }

  // ===== Generate Report =====
  async function generate(id: string): Promise<boolean> {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await generateReport(id);

      if (!response.success) {
        throw new Error(response.error || "Failed to generate report");
      }

      setState((prev) => ({ ...prev, loading: false }));
      return true;

    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
      return false;
    }
  }

  // ===== Poll Report until completed =====
  async function pollReport(id: string): Promise<Partial<AssessmentDocument> | null> {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const maxAttempts = 15;
    const intervalMs = 3000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await getReport(id);

        if (response.data?.status === "completed") {
          setState((prev) => ({
            ...prev,
            loading: false,
            report: response.data,
          }));
          return response.data;
        }

        if (response.data?.status === "failed") {
          throw new Error("Report generation failed");
        }

        // Wait 3 seconds before next attempt
        await new Promise((resolve) => setTimeout(resolve, intervalMs));

      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        return null;
      }
    }

    setState((prev) => ({
      ...prev,
      loading: false,
      error: "Report generation timed out",
    }));
    return null;
  }

  // ===== Generate PDF =====
  async function createPDF(id: string): Promise<string | null> {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await generatePDF(id);
      const urlResponse = await getPdfUrl(id);

      if (!urlResponse.success || !urlResponse.data) {
        throw new Error("Failed to get PDF URL");
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        pdfUrl: urlResponse.data!.sasUrl,
      }));

      return urlResponse.data.sasUrl;

    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
      return null;
    }
  }

  // ===== Send Report by Email =====
  async function send(id: string, email: string): Promise<boolean> {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await sendReport(id, email);

      if (!response.success) {
        throw new Error(response.error || "Failed to send report");
      }

      setState((prev) => ({ ...prev, loading: false }));
      return true;

    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
      return false;
    }
  }

  return {
    ...state,
    submit,
    generate,
    pollReport,
    createPDF,
    send,
  };
}