import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getContainer } from "../lib/cosmosClient";
import { AssessmentDocument } from "../types/assessment";
import { ApiResponse } from "../types/api";

async function getReport(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("getReport called");

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
          error: "Report not found"
        } as ApiResponse<null>
      };
    }

    if (document.status !== "completed") {
      return {
        status: 202,
        jsonBody: {
          success: true,
          data: { status: document.status },
          error: null
        } as ApiResponse<{ status: string }>
      };
    }

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          id: document.id,
          companyName: document.companyName,
          status: document.status,
          meta: document.meta,
          report: document.report,
          insights: document.insights,
          pdfUrl: document.pdfUrl,
          sharedLink: document.sharedLink
        },
        error: null
      } as ApiResponse<Partial<AssessmentDocument>>
    };

  } catch (error) {
    context.error(error);
    return {
      status: 500,
      jsonBody: {
        success: false,
        data: null,
        error: "Failed to fetch report"
      } as ApiResponse<null>
    };
  }
}

app.http("getReport", {
  methods: ["GET"],
  authLevel: "function",
  route: "assessment/{id}/report",
  handler: getReport
});