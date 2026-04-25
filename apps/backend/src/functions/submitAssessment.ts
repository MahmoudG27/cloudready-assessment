import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { v4 as uuidv4 } from "uuid";
import { getContainer } from "../lib/cosmosClient";
import { AssessmentDocument, AssessmentAnswers, AssessmentScore } from "../types/assessment";
import { ApiResponse } from "../types/api";

async function submitAssessment(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("submitAssessment called");

  try {
    const body = await request.json() as {
      companyName: string;
      answers: AssessmentAnswers;
      score: AssessmentScore;
    };

    if (!body.companyName || !body.answers || !body.score) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          data: null,
          error: "companyName, answers, and score are required"
        } as ApiResponse<null>
      };
    }

    const now = new Date().toISOString();
    const id = `RPT-${uuidv4().substring(0, 8).toUpperCase()}`;
    const userId = request.headers.get("x-user-id") ?? "anonymous";

    const document: AssessmentDocument = {
      id,
      userId,
      companyName: body.companyName,
      createdAt: now,
      updatedAt: now,
      status: "draft",
      meta: {
        aiModel: "gpt-4o",
        promptVersion: "v1.0",
        generatedAt: null,
        confidenceScore: null
      },
      error: {
        message: null,
        code: null,
        retryable: null,
        retryCount: 0,
        failedAt: null
      },
      answers: body.answers,
      score: body.score,
      insights: {
        topRisk: "",
        topOpportunity: "",
        priority: "",
        level: body.score.total >= 71 ? "Advanced" : body.score.total >= 41 ? "Developing" : "Beginner"
      },
      report: {
        data: null,
        ui: null
      },
      usage: {
        viewed: false,
        viewedAt: null,
        shared: false
      },
      pdfUrl: null,
      sharedLink: null
    };

    const container = getContainer();
    await container.items.create(document);

    context.log(`Assessment created: ${id}`);

    return {
      status: 201,
      jsonBody: {
        success: true,
        data: { id, status: "draft" },
        error: null
      } as ApiResponse<{ id: string; status: string }>
    };

  } catch (error) {
    context.error(error);
    return {
      status: 500,
      jsonBody: {
        success: false,
        data: null,
        error: "Internal server error"
      } as ApiResponse<null>
    };
  }
}

app.http("submitAssessment", {
  methods: ["POST"],
  authLevel: "function",
  route: "assessment",
  handler: submitAssessment
});