import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getContainer } from "../lib/cosmosClient";
import { AssessmentDocument } from "../types/assessment";
import { ApiResponse } from "../types/api";

async function getAssessment(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("getAssessment called");

  const id = request.params.id;
  const userId = request.headers.get("x-user-id") ?? "anonymous";

  try {
    const container = getContainer();

    const { resource: document } = await container
      .item(id, userId)
      .read<AssessmentDocument>();

    if (!document) {
      return {
        status: 404,
        jsonBody: {
          success: false,
          data: null,
          error: "Assessment not found"
        } as ApiResponse<null>
      };
    }

    // Mark as viewed
    if (!document.usage.viewed) {
      await container.items.upsert({
        ...document,
        usage: {
          viewed: true,
          viewedAt: new Date().toISOString(),
          shared: document.usage.shared
        }
      });
    }

    const { _rid, _self, _etag, _attachments, _ts, ...cleanDocument } = document as any;

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: cleanDocument,
        error: null
      } as ApiResponse<AssessmentDocument>
    };

  } catch (error) {
    context.error(error);
    return {
      status: 500,
      jsonBody: {
        success: false,
        data: null,
        error: "Failed to fetch assessment"
      } as ApiResponse<null>
    };
  }
}

app.http("getAssessment", {
  methods: ["GET"],
  authLevel: "function",
  route: "assessment/{id}",
  handler: getAssessment
});