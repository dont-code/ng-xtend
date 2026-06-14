/**
 * Information about an uploaded document, including its name and retrieval identifier.
 */
export type UploadedDocumentInfo = {
  documentName: string;
  isUrl: boolean;
  documentId?: string;
};
