import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getInvitationsContainer } from "../lib/cosmosClient";
import { InvitationDocument } from "../types/assessment";
import { ApiResponse } from "../types/api";

async function validateToken(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("validateToken called");

  const token = request.params.token;

  try {
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
          error: "Invalid invitation link"
        } as ApiResponse<null>
      };
    }

    // Check if already marked expired
    if (invitation.status === "expired") {
      return {
        status: 410,
        jsonBody: {
          success: false,
          data: null,
          error: "This invitation link has expired"
        } as ApiResponse<null>
      };
    }

    // Check expiry date
    if (new Date() > new Date(invitation.expiresAt)) {
      await container.items.upsert({
        ...invitation,
        lastAccessedAt: new Date().toISOString()
      });
      return {
        status: 410,
        jsonBody: {
          success: false,
          data: null,
          error: "This invitation link has expired"
        } as ApiResponse<null>
      };
    }

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          status: invitation.status,
          companyName: invitation.companyName,
          email: invitation.email,
          industry: invitation.industry ?? null,
          expiresAt: invitation.expiresAt,
          assessmentId: invitation.assessmentId,
        },
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
        error: "Failed to validate token"
      } as ApiResponse<null>
    };
  }
}

app.http("validateToken", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "invitations/{token}/validate",
  handler: validateToken
});