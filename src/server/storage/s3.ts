import { createHash, createHmac } from "node:crypto";
import type { ObjectStorage } from "@/server/storage/types";

function sha256Hex(data: Buffer | string) {
  return createHash("sha256").update(data).digest("hex");
}

function hmac(key: Buffer | string, data: string) {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

function encodePath(value: string) {
  return value
    .split("/")
    .map((segment) => encodeURIComponent(segment).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`))
    .join("/");
}

function amzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function shortDate(date: Date) {
  return amzDate(date).slice(0, 8);
}

type S3Config = {
  bucket: string;
  region: string;
  accessKey: string;
  secretKey: string;
  endpoint?: string;
  pathStyle: boolean;
};

function configFromEnv(): S3Config | null {
  const bucket = process.env.S3_BUCKET?.trim();
  const accessKey = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  if (!bucket || !accessKey || !secretKey) return null;
  const endpoint = process.env.S3_ENDPOINT?.trim() || undefined;
  const pathStyle =
    process.env.S3_FORCE_PATH_STYLE === "true" || Boolean(endpoint);
  return {
    bucket,
    region: process.env.S3_REGION?.trim() || (endpoint ? "auto" : "us-east-1"),
    accessKey,
    secretKey,
    endpoint,
    pathStyle,
  };
}

function signingKey(secret: string, date: string, region: string) {
  const kDate = hmac(`AWS4${secret}`, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, "s3");
  return hmac(kService, "aws4_request");
}

function requestParts(config: S3Config, key: string) {
  const encodedKey = encodePath(key);
  if (config.endpoint) {
    const base = new URL(config.endpoint);
    const host = base.host;
    const prefix = base.pathname.replace(/\/$/, "");
    const canonicalUri = config.pathStyle
      ? `${prefix}/${config.bucket}/${encodedKey}`
      : `${prefix}/${encodedKey}`;
    return {
      host,
      url: `${base.protocol}//${host}${canonicalUri}`,
      canonicalUri: canonicalUri || "/",
    };
  }
  const host = `${config.bucket}.s3.${config.region}.amazonaws.com`;
  return {
    host,
    url: `https://${host}/${encodedKey}`,
    canonicalUri: `/${encodedKey}`,
  };
}

async function signedFetch(
  config: S3Config,
  method: string,
  key: string,
  body?: Buffer,
  contentType?: string,
) {
  const now = new Date();
  const amz = amzDate(now);
  const date = shortDate(now);
  const payload = body ?? Buffer.alloc(0);
  const payloadHash = sha256Hex(payload);
  const { host, url, canonicalUri } = requestParts(config, key);
  const headers: Record<string, string> = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amz,
  };
  if (contentType) headers["content-type"] = contentType;

  const signedHeaderNames = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaderNames
    .map((name) => `${name}:${headers[name]}\n`)
    .join("");
  const signedHeaders = signedHeaderNames.join(";");
  const canonicalRequest = [
    method,
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const scope = `${date}/${config.region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amz,
    scope,
    sha256Hex(canonicalRequest),
  ].join("\n");
  const signature = createHmac("sha256", signingKey(config.secretKey, date, config.region))
    .update(stringToSign, "utf8")
    .digest("hex");
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body && method !== "GET" && method !== "DELETE" ? new Uint8Array(body) : undefined,
  });
  if (!response.ok && !(method === "DELETE" && response.status === 404)) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Object storage ${method} failed (${response.status}). ${detail.slice(0, 180)}`);
  }
  return response;
}

export function createS3Storage(): ObjectStorage | null {
  const config = configFromEnv();
  if (!config) return null;
  return {
    async put(key, body, contentType) {
      await signedFetch(config, "PUT", key, body, contentType);
    },
    async get(key) {
      const response = await signedFetch(config, "GET", key);
      return Buffer.from(await response.arrayBuffer());
    },
    async delete(key) {
      await signedFetch(config, "DELETE", key);
    },
  };
}

export function isS3Configured() {
  return Boolean(configFromEnv());
}
