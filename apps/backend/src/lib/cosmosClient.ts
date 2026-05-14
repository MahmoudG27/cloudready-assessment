import { CosmosClient, Container } from "@azure/cosmos";

if (!process.env.COSMOS_CONNECTION_STRING) {
  throw new Error("Missing COSMOS_CONNECTION_STRING");
}

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);

const DATABASE_NAME = process.env.COSMOS_DATABASE_NAME ?? "cloudready-db";
const ASSESSMENTS_CONTAINER = process.env.COSMOS_CONTAINER ?? "assessments";
const INVITATIONS_CONTAINER = process.env.COSMOS_INVITATIONS_CONTAINER ?? "invitations";

let assessmentsContainer: Container;
let invitationsContainer: Container;

export function getContainer(): Container {
  if (!assessmentsContainer) {
    assessmentsContainer = client
      .database(DATABASE_NAME)
      .container(ASSESSMENTS_CONTAINER);
  }
  return assessmentsContainer;
}

export function getInvitationsContainer(): Container {
  if (!invitationsContainer) {
    invitationsContainer = client
      .database(DATABASE_NAME)
      .container(INVITATIONS_CONTAINER);
  }
  return invitationsContainer;
}