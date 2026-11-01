/** Keeps the first letter and the domain: enough to recognise your own address, not to learn someone else's. */
export function maskEmail(email: string) {
  const at = email.lastIndexOf("@");
  if (at <= 0) return "***";
  return `${Array.from(email)[0]}***${email.slice(at)}`;
}
