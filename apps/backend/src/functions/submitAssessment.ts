import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { v4 as uuidv4 } from "uuid";
import { getContainer, getInvitationsContainer } from "../lib/cosmosClient";
import { AssessmentDocument, AssessmentAnswers, AssessmentScore, InvitationDocument } from "../types/assessment";
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
      confidence: number;
      token?: string;
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

    // 1. Validate token FIRST
    if (body.token) {
      try {
        const invContainer = getInvitationsContainer();
        const { resource: inv } = await invContainer
          .item(body.token, body.token)
          .read<InvitationDocument>();

        if (!inv || inv.status !== "pending" || new Date() > new Date(inv.expiresAt)) {
          return {
            status: 400,
            jsonBody: {
              success: false,
              data: null,
              error: "Invalid or expired invitation token"
            } as ApiResponse<null>
          };
        }
      } catch {
        return {
          status: 400,
          jsonBody: {
            success: false,
            data: null,
            error: "Invalid invitation token"
          } as ApiResponse<null>
        };
      }
    }

    // 2. Build document
    const now = new Date().toISOString();
    const id = `RPT-${uuidv4().substring(0, 8).toUpperCase()}`;
    const userId = request.headers.get("x-user-id") ?? "anonymous";

    const document: AssessmentDocument = {
      id,
      userId,
      companyName: body.companyName,
      invitationToken: body.token ?? undefined,
      createdAt: now,
      updatedAt: now,
      status: "draft",
      meta: {
        aiModel: "gpt-4o",
        promptVersion: "v1.0",
        generatedAt: null,
        confidenceScore: body.confidence
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

    // 3. Save to Cosmos
    const container = getContainer();
    await container.items.create(document);
    context.log(`Assessment created: ${id}`);

    // 4. Complete invitation
    if (body.token) {
      try {
        const invContainer = getInvitationsContainer();
        const { resource: invitation } = await invContainer
          .item(body.token, body.token)
          .read<InvitationDocument>();

        if (invitation && invitation.status === "pending") {
          await invContainer.items.upsert({
            ...invitation,
            status: "completed",
            assessmentId: id,
            completedAt: new Date().toISOString()
          });
          context.log(`Invitation completed: ${body.token} → ${id}`);
        }
      } catch (invError) {
        context.log("Warning: Could not complete invitation:", invError);
      }
    }

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