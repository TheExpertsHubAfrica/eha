import { siteConfig } from "@/lib/site-config";

function referencePrefix() {
  const prefix = siteConfig.shortName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return prefix || "TEHA";
}

export function formatApplicationReference(year: number, sequence: number) {
  if (!Number.isInteger(year) || year < 2000 || year > 9999) {
    throw new Error("Invalid reference year.");
  }
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 999999) {
    throw new Error("Invalid reference sequence.");
  }
  return `${referencePrefix()}-${year}-${String(sequence).padStart(6, "0")}`;
}

export function parseApplicationReference(value: string) {
  const match = /^([A-Z]{2,8})-(\d{4})-(\d{6})$/.exec(value.trim().toUpperCase());
  if (!match) return null;
  return { prefix: match[1], year: Number(match[2]), sequence: Number(match[3]) };
}

export function confirmationPath(reference: string) {
  return `/application/success/${encodeURIComponent(reference)}`;
}
