import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getInvitationsContainer } from "../lib/cosmosClient";
import { InvitationDocument } from "../types/assessment";
import { ApiResponse } from "../types/api";
import * as crypto from "crypto";

async function createInvitation(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("createInvitation called");

  try {
    const body = await request.json() as {
      email: string;
      companyName: string;
      industry?: string;
      notes?: string;
      createdBy: string;
    };

    if (!body.email || !body.companyName || !body.createdBy) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          data: null,
          error: "email, companyName, and createdBy are required"
        } as ApiResponse<null>
      };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 14);

    const invitation: InvitationDocument = {
      id: token,
      token,
      email: body.email,
      companyName: body.companyName,
      industry: body.industry,
      notes: body.notes,
      status: "pending",
      assessmentId: null,
      createdBy: body.createdBy,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      completedAt: null,
    };

    const container = getInvitationsContainer();
    await container.items.create(invitation);

    const inviteUrl = `${process.env.FRONTEND_URL}/a/${token}`;

    context.log(`Invitation created: ${token} for ${body.email}`);

    return {
      status: 201,
      jsonBody: {
        success: true,
        data: {
          token,
          inviteUrl,
          expiresAt: expiresAt.toISOString()
        },
        error: null
      } as ApiResponse<{ token: string; inviteUrl: string; expiresAt: string }>
    };

  } catch (error) {
    context.error(error);
    return {
      status: 500,
      jsonBody: {
        success: false,
        data: null,
        error: "Failed to create invitation"
      } as ApiResponse<null>
    };
  }
}

app.http("createInvitation", {
  methods: ["POST"],
  authLevel: "function",
  route: "invitations/create",
  handler: createInvitation
});