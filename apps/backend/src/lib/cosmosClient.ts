import { CosmosClient, Container } from "@azure/cosmos";

if (!process.env.COSMOS_CONNECTION_STRING) {
  throw new Error("Missing COSMOS_CONNECTION_STRING");
}

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);

export function getContainer(): Container {
  return client
    .database("cloudready-db")
    .container("assessments");
}