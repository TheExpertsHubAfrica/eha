/** Must match between the widget and the server check, so a token only works on the form it came from. */
export const TURNSTILE_ACTIONS = {
  applyStart: "apply_start",
  resumeLink: "resume_link",
  applicationLink: "application_link",
  contact: "contact",
} as const;

export const TURNSTILE_FAILED_MESSAGE = "The security check did not pass. Please try again.";
export const TURNSTILE_INCOMPLETE_MESSAGE = "Please wait for the security check to finish, then try again.";
