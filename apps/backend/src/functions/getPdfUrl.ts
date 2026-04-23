import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getContainer } from "../lib/cosmosClient";
import { generateSasUrl } from "../lib/storageClient";
import { AssessmentDocument } from "../types/assessment";
import { ApiResponse } from "../types/api";

async function getPdfUrl(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("getPdfUrl called");

  const id = request.params.id;
  const userId = request.headers.get("x-user-id") ?? "anonymous";
  const container = getContainer();

  try {
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

    if (!document.pdfUrl) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          data: null,
          error: "PDF has not been generated yet"
        } as ApiResponse<null>
      };
    }

    // Generate SAS URL valid for 24 hours
    const sasUrl = await generateSasUrl(id);

    context.log(`SAS URL generated for: ${id}`);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: { id, sasUrl },
        error: null
      } as ApiResponse<{ id: string; sasUrl: string }>
    };

  } catch (error) {
    context.error(error);
    return {
      status: 500,
      jsonBody: {
        success: false,
        data: null,
        error: "Failed to generate PDF URL"
      } as ApiResponse<null>
    };
  }
}

app.http("getPdfUrl", {
  methods: ["GET"],
  authLevel: "function",
  route: "assessment/{id}/pdf-url",
  handler: getPdfUrl
});