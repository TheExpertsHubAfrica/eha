type EmailConfig = {
  apiKey?: string;
  from?: string;
  adminTo?: string;
};

export function getEmailConfig(): EmailConfig {
  return {
    apiKey: process.env.RESEND_API_KEY?.trim() || undefined,
    from: process.env.RESEND_FROM_EMAIL?.trim() || undefined,
    adminTo: process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || undefined,
  };
}

export function applicantMailEnabled() {
  const config = getEmailConfig();
  return Boolean(config.apiKey && config.from);
}

export function adminMailEnabled() {
  const config = getEmailConfig();
  return Boolean(config.apiKey && config.from && config.adminTo);
}
