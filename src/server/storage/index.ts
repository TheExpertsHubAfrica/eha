import { localStorageDriver } from "@/server/storage/local";
import { createS3Storage, isS3Configured } from "@/server/storage/s3";
import type { ObjectStorage } from "@/server/storage/types";

let cached: ObjectStorage | undefined;

export function getObjectStorage(): ObjectStorage {
  if (cached) return cached;
  cached = createS3Storage() ?? localStorageDriver;
  return cached;
}

export function storageDriverName() {
  return isS3Configured() ? "s3" : "local";
}
