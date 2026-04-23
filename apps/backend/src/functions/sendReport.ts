import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getContainer } from "../lib/cosmosClient";
import { generateSasUrl } from "../lib/storageClient";
import { AssessmentDocument } from "../types/assessment";
import { ApiResponse } from "../types/api";

async function sendReport(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("sendReport called");

  const id = request.params.id;
  const userId = request.headers.get("x-user-id") ?? "anonymous";
  const container = getContainer();

  try {
    const body = await request.json() as { email: string };

    if (!body.email) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          data: null,
          error: "Email is required"
        } as ApiResponse<null>
      };
    }

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

    if (document.status !== "completed") {
      return {
        status: 400,
        jsonBody: {
          success: false,
          data: null,
          error: "Report must be completed before sending"
        } as ApiResponse<null>
      };
    }

    // Generate SAS URL for PDF
    const reportUrl = document.pdfUrl
      ? await generateSasUrl(id)
      : null;

    // Call Logic App trigger
    const logicAppUrl = process.env.LOGIC_APP_TRIGGER_URL!;

    const logicAppResponse = await fetch(logicAppUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: body.email,
        subject: `Cloud Readiness Report — ${document.companyName}`,
        reportId: document.id,
        companyName: document.companyName,
        reportUrl: reportUrl ?? "Report available in portal"
      })
    });

    if (!logicAppResponse.ok) {
      throw new Error(`Logic App failed: ${logicAppResponse.status}`);
    }

    // Update usage.shared
    await container.items.upsert({
      ...document,
      usage: {
        ...document.usage,
        shared: true
      },
      updatedAt: new Date().toISOString()
    });

    context.log(`Report sent to ${body.email}: ${id}`);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: { id, sentTo: body.email },
        error: null
      } as ApiResponse<{ id: string; sentTo: string }>
    };

  } catch (error) {
    context.error(error);
    return {
      status: 500,
      jsonBody: {
        success: false,
        data: null,
        error: "Failed to send report"
      } as ApiResponse<null>
    };
  }
}

app.http("sendReport", {
  methods: ["POST"],
  authLevel: "function",
  route: "assessment/{id}/send",
  handler: sendReport
});