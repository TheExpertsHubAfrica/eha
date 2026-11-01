const FORMULA_START = /^[\t\r]|^\s*[=+\-@＝＋－＠]/;
// Digits and phone punctuation can't call a function, so "+233 20 123" keeps its plus sign.
const PHONE_LIKE = /^\+?[\d\s()-]+$/;

/** Formats a CSV cell. A leading apostrophe stops spreadsheets running applicant text as a formula. */
export function csvCell(value: string | number | null | undefined) {
  if (typeof value === "number") return String(value);
  let text = value ?? "";
  if (FORMULA_START.test(text) && !PHONE_LIKE.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}
