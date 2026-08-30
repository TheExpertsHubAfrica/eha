export class ObjectStorageNotConfiguredError extends Error {
  constructor(
    message = "Document storage is not configured for this environment. Connect Vercel Blob or set S3 credentials.",
  ) {
    super(message);
    this.name = "ObjectStorageNotConfiguredError";
  }
}
