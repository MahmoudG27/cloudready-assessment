import { BlobServiceClient, BlobSASPermissions } from "@azure/storage-blob";

if (!process.env.STORAGE_CONNECTION_STRING) {
  throw new Error("Missing STORAGE_CONNECTION_STRING");
}

const containerClient = BlobServiceClient
  .fromConnectionString(process.env.STORAGE_CONNECTION_STRING)
  .getContainerClient("reports");

export async function uploadPDF(
  reportId: string,
  pdfBuffer: Buffer
): Promise<string> {
  const blockBlobClient = containerClient.getBlockBlobClient(`${reportId}.pdf`);
  await blockBlobClient.uploadData(pdfBuffer, {
    blobHTTPHeaders: { blobContentType: "application/pdf" },
  });
  return blockBlobClient.url;
}

export async function generateSasUrl(reportId: string): Promise<string> {
  const blockBlobClient = containerClient.getBlockBlobClient(`${reportId}.pdf`);
  const expiresOn = new Date();
  expiresOn.setHours(expiresOn.getHours() + 24);

  const sasUrl = await blockBlobClient.generateSasUrl({
    permissions: BlobSASPermissions.parse("r"),
    expiresOn,
  });

  return sasUrl;
}