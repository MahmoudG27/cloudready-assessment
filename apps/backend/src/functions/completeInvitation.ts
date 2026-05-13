import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getInvitationsContainer } from "../lib/cosmosClient";
import { InvitationDocument } from "../types/assessment";
import { ApiResponse } from "../types/api";

async function completeInvitation(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("completeInvitation called");

  const token = request.params.token;

  try {
    const body = await request.json() as { assessmentId: string };

    if (!body.assessmentId) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          data: null,
          error: "assessmentId is required"
        } as ApiResponse<null>
      };
    }

    const container = getInvitationsContainer();
    const { resource: invitation } = await container
      .item(token, token)
      .read<InvitationDocument>();

    if (!invitation) {
      return {
        status: 404,
        jsonBody: {
          success: false,
          data: null,
          error: "Invitation not found"
        } as ApiResponse<null>
      };
    }

    if (invitation.status === "completed") {
      return {
        status: 409,
        jsonBody: {
          success: false,
          data: null,
          error: "Invitation already completed"
        } as ApiResponse<null>
      };
    }

    if (new Date() > new Date(invitation.expiresAt) || invitation.status === "expired") {
      return {
        status: 410,
        jsonBody: {
          success: false,
          data: null,
          error: "Invitation has expired"
        } as ApiResponse<null>
      };
    }

    await container.items.upsert({
      ...invitation,
      status: "completed",
      assessmentId: body.assessmentId,
      completedAt: new Date().toISOString()
    });

    context.log(`Invitation completed: ${token} → ${body.assessmentId}`);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: { token, assessmentId: body.assessmentId },
        error: null
      } as ApiResponse<{ token: string; assessmentId: string }>
    };

  } catch (error) {
    context.error(error);
    return {
      status: 500,
      jsonBody: {
        success: false,
        data: null,
        error: "Failed to complete invitation"
      } as ApiResponse<null>
    };
  }
}

app.http("completeInvitation", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "invitations/{token}/complete",
  handler: completeInvitation
});