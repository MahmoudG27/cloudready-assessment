import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getContainer } from "../lib/cosmosClient";
import { AssessmentDocument } from "../types/assessment";
import { PaginatedResponse } from "../types/api";

async function getAssessments(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("getAssessments called");

  try {
    const container = getContainer();

    const { resources } = await container.items
      .query<AssessmentDocument>({
        query: "SELECT c.id, c.companyName, c.status, c.createdAt, c.insights, c.report.data.readinessScore FROM c ORDER BY c.createdAt DESC"
      })
      .fetchAll();

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: resources,
        total: resources.length,
        error: null
      } as PaginatedResponse<Partial<AssessmentDocument>>
    };

  } catch (error) {
    context.error(error);
    return {
      status: 500,
      jsonBody: {
        success: false,
        data: [],
        total: 0,
        error: "Failed to fetch assessments"
      } as PaginatedResponse<Partial<AssessmentDocument>>
    };
  }
}

app.http("getAssessments", {
  methods: ["GET"],
  authLevel: "function",
  route: "assessments",
  handler: getAssessments
});