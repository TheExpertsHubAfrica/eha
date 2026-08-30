import { ObjectStorageNotConfiguredError } from "@/server/storage/errors";
import { localStorageDriver } from "@/server/storage/local";
import { createS3Storage, isS3Configured } from "@/server/storage/s3";
import { createVercelBlobStorage, isVercelBlobConfigured } from "@/server/storage/vercel-blob";
import type { ObjectStorage } from "@/server/storage/types";

export { ObjectStorageNotConfiguredError } from "@/server/storage/errors";

let cached: ObjectStorage | undefined;

export function getObjectStorage(): ObjectStorage {
  if (cached) return cached;

  const driver = createS3Storage() ?? createVercelBlobStorage();
  if (driver) {
    cached = driver;
    return cached;
  }

  if (process.env.VERCEL === "1") {
    throw new ObjectStorageNotConfiguredError();
  }

  cached = localStorageDriver;
  return cached;
}

export function storageDriverName() {
  if (isS3Configured()) return "s3";
  if (isVercelBlobConfigured() || process.env.VERCEL === "1") return "vercel-blob";
  return "local";
}
