/** Shows only the initial of each word, at a fixed length, so word lengths are not revealed. */
export function maskPersonName(name: string) {
  const masked = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${Array.from(word)[0]}***`);
  return masked.join(" ") || "***";
}
