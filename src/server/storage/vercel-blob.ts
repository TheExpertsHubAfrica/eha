import { del, get, put } from "@vercel/blob";
import type { ObjectStorage } from "@/server/storage/types";

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
}

function putOptions(contentType: string) {
  const token = blobToken();
  return {
    access: "private" as const,
    contentType,
    addRandomSuffix: false,
    ...(token ? { token } : {}),
  };
}

function readOptions() {
  const token = blobToken();
  return {
    access: "private" as const,
    ...(token ? { token } : {}),
  };
}

async function streamToBuffer(stream: ReadableStream<Uint8Array>) {
  return Buffer.from(await new Response(stream).arrayBuffer());
}

export function isVercelBlobConfigured() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() || process.env.BLOB_STORE_ID?.trim(),
  );
}

export function createVercelBlobStorage(): ObjectStorage | null {
  if (!isVercelBlobConfigured()) {
    return null;
  }

  return {
    async put(key, body, contentType) {
      await put(key, body, putOptions(contentType));
    },
    async get(key) {
      const result = await get(key, readOptions());
      if (!result || result.statusCode !== 200 || !result.stream) {
        throw new Error(`Blob not found (${result?.statusCode ?? "unknown"}).`);
      }
      return streamToBuffer(result.stream);
    },
    async delete(key) {
      await del(key, blobToken() ? { token: blobToken() } : undefined);
    },
  };
}
