export const HARD_MAX_BYTES = 8 * 1024 * 1024;

export const ALLOWED_MIME = {
  pdf: "application/pdf",
  jpeg: "image/jpeg",
  png: "image/png",
} as const;

const BLOCKED_EXTENSIONS = new Set([
  "apk",
  "app",
  "asp",
  "aspx",
  "bash",
  "bat",
  "bin",
  "cgi",
  "class",
  "cmd",
  "com",
  "cpl",
  "dll",
  "dmg",
  "dylib",
  "exe",
  "hta",
  "htm",
  "html",
  "inf",
  "iso",
  "jar",
  "js",
  "jse",
  "jsp",
  "mjs",
  "cjs",
  "msi",
  "php",
  "phtml",
  "pif",
  "ps1",
  "reg",
  "scr",
  "sh",
  "so",
  "svg",
  "svgz",
  "vbe",
  "vbs",
  "war",
  "wasm",
  "ws",
  "wsc",
  "wsf",
  "xhtml",
  "xml",
  "zsh",
]);

const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

export type UploadInspectOk = {
  ok: true;
  mimeType: string;
  extension: string;
  originalFilename: string;
};

export type UploadInspectFail = {
  ok: false;
  code: "blocked" | "type" | "size" | "name";
  error: string;
};

export type UploadInspectResult = UploadInspectOk | UploadInspectFail;

export function sanitizeFilename(name: string) {
  const base = name.replace(/\\/g, "/").split("/").pop() ?? "file";
  const cleaned = base
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[<>:"|?*]+/g, "")
    .replace(/^\.+/, "")
    .trim()
    .replace(/[. ]+$/g, "");
  const scoped = cleaned.slice(0, 120);
  if (!scoped || scoped === "." || scoped === "..") return "upload";
  return scoped;
}

export function acceptAttribute(types: string[]) {
  const parts: string[] = [];
  for (const type of types) {
    if (type === "application/pdf") parts.push(".pdf", "application/pdf");
    if (type === "image/jpeg") parts.push(".jpg", ".jpeg", "image/jpeg");
    if (type === "image/png") parts.push(".png", "image/png");
  }
  return [...new Set(parts)].join(",");
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function filenameParts(name: string) {
  return name
    .toLowerCase()
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);
}

function sniffMime(bytes: Buffer): string | null {
  if (bytes.length < 8) return null;
  if (bytes.subarray(0, 4).toString("latin1") === "%PDF") return ALLOWED_MIME.pdf;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return ALLOWED_MIME.jpeg;
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return ALLOWED_MIME.png;
  }
  return null;
}

function looksLikeScript(bytes: Buffer) {
  const head = bytes.subarray(0, 512).toString("utf8").toLowerCase().replace(/^\u003f\u003e/, "");
  const trimmed = head.trim();
  return (
    trimmed.startsWith("<!doctype html") ||
    trimmed.startsWith("<html") ||
    trimmed.startsWith("<svg") ||
    trimmed.startsWith("<script") ||
    trimmed.startsWith("<?xml") ||
    trimmed.startsWith("mz") ||
    (bytes[0] === 0x4d && bytes[1] === 0x5a)
  );
}

export function inspectUpload(
  bytes: Buffer,
  filename: string,
  requirement: { acceptedTypes: string[]; maxSizeMb: number },
): UploadInspectResult {
  const originalFilename = sanitizeFilename(filename);
  const parts = filenameParts(originalFilename);
  if (parts.some((part) => BLOCKED_EXTENSIONS.has(part))) {
    return { ok: false, code: "blocked", error: "That file type is not allowed." };
  }

  const maxBytes = Math.min(Math.max(requirement.maxSizeMb, 1) * 1024 * 1024, HARD_MAX_BYTES);
  if (bytes.length === 0) {
    return { ok: false, code: "size", error: "The file is empty." };
  }
  if (bytes.length > HARD_MAX_BYTES) {
    return { ok: false, code: "size", error: "The file is larger than the 8 MB platform limit." };
  }
  if (bytes.length > maxBytes) {
    return {
      ok: false,
      code: "size",
      error: `The file is larger than the ${requirement.maxSizeMb} MB limit for this document.`,
    };
  }

  if (looksLikeScript(bytes) && sniffMime(bytes) === null) {
    return { ok: false, code: "blocked", error: "That file type is not allowed." };
  }

  const detected = sniffMime(bytes);
  if (!detected) {
    return { ok: false, code: "type", error: "The file contents do not match a supported PDF, JPEG, or PNG." };
  }
  if (!requirement.acceptedTypes.includes(detected)) {
    return {
      ok: false,
      code: "type",
      error: "This document slot does not accept that file type.",
    };
  }

  const expectedExt = MIME_TO_EXT[detected];
  const lastExt = parts.at(-1);
  if (lastExt && lastExt !== expectedExt && !(detected === ALLOWED_MIME.jpeg && lastExt === "jpeg")) {
    return {
      ok: false,
      code: "type",
      error: "The filename extension does not match the file contents.",
    };
  }

  return {
    ok: true,
    mimeType: detected,
    extension: expectedExt,
    originalFilename,
  };
}
