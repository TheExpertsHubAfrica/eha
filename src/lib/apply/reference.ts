import { siteConfig } from "@/lib/site-config";

function referencePrefix() {
  const prefix = siteConfig.shortName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return prefix || "TEHA";
}

/** The suffix makes new references unguessable; older references have none and stay valid. */
export function formatApplicationReference(year: number, sequence: number, suffix?: string) {
  if (!Number.isInteger(year) || year < 2000 || year > 9999) {
    throw new Error("Invalid reference year.");
  }
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 999999) {
    throw new Error("Invalid reference sequence.");
  }
  if (suffix !== undefined && !/^[A-Z0-9]{6}$/.test(suffix)) {
    throw new Error("Invalid reference suffix.");
  }
  const base = `${referencePrefix()}-${year}-${String(sequence).padStart(6, "0")}`;
  return suffix ? `${base}-${suffix}` : base;
}

export function parseApplicationReference(value: string) {
  const match = /^([A-Z]{2,8})-(\d{4})-(\d{6})(?:-[A-Z0-9]{6})?$/.exec(value.trim().toUpperCase());
  if (!match) return null;
  return { prefix: match[1], year: Number(match[2]), sequence: Number(match[3]) };
}

export function confirmationPath(reference: string) {
  return `/application/success/${encodeURIComponent(reference)}`;
}
