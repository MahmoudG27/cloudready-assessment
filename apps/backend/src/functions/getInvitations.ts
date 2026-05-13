import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getInvitationsContainer } from "../lib/cosmosClient";
import { InvitationDocument } from "../types/assessment";
import { ApiResponse } from "../types/api";

async function getInvitations(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("getInvitations called");

  try {
    const container = getInvitationsContainer();

    const { resources } = await container.items
      .query<InvitationDocument>({
        query: "SELECT * FROM c ORDER BY c.createdAt DESC"
      })
      .fetchAll();

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: resources,
        total: resources.length,
        error: null
      }
    };

  } catch (error) {
    context.error(error);
    return {
      status: 500,
      jsonBody: {
        success: false,
        data: null,
        error: "Failed to get invitations"
      } as ApiResponse<null>
    };
  }
}

app.http("getInvitations", {
  methods: ["GET"],
  authLevel: "function",
  route: "invitations",
  handler: getInvitations
});