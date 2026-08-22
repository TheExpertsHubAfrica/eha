const PREVIEWABLE_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

export function isPreviewableMime(mimeType: string) {
  return PREVIEWABLE_MIME.has(mimeType);
}

export function contentDisposition(
  filename: string,
  disposition: "attachment" | "inline" = "attachment",
) {
  const ascii =
    filename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_") || "download";
  return `${disposition}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export function parseDisposition(request: Request): "attachment" | "inline" {
  const value = new URL(request.url).searchParams.get("disposition");
  return value === "inline" ? "inline" : "attachment";
}

export function documentFileUrl(
  baseHref: string,
  disposition: "attachment" | "inline" = "attachment",
) {
  if (disposition === "attachment") return baseHref;
  const join = baseHref.includes("?") ? "&" : "?";
  return `${baseHref}${join}disposition=inline`;
}
