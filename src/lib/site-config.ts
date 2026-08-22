function env(key: string) {
  return process.env[key]?.trim() ?? "";
}

const name = env("NEXT_PUBLIC_SITE_NAME") || "The Experts Hub Africa";
const shortName = env("NEXT_PUBLIC_SITE_SHORT_NAME") || "TEHA";

export type PublicSite = {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  url: string;
  locale: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  whatsapp: string;
  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
};

export const siteConfig: PublicSite = {
  name,
  shortName,
  tagline:
    "Work, travel and study opportunities abroad — guided from start to finish.",
  description: `${name} helps applicants discover overseas work, travel packages, and study pathways, then complete a structured application with document guidance.`,
  url: env("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000",
  locale: "en_GH",
  phone: env("NEXT_PUBLIC_SITE_PHONE"),
  email: env("NEXT_PUBLIC_SITE_EMAIL"),
  address: env("NEXT_PUBLIC_SITE_ADDRESS"),
  hours: env("NEXT_PUBLIC_BUSINESS_HOURS"),
  whatsapp: env("NEXT_PUBLIC_WHATSAPP_NUMBER"),
  social: {
    facebook: env("NEXT_PUBLIC_FACEBOOK_URL"),
    instagram: env("NEXT_PUBLIC_INSTAGRAM_URL"),
    linkedin: env("NEXT_PUBLIC_LINKEDIN_URL"),
    youtube: env("NEXT_PUBLIC_YOUTUBE_URL"),
  },
};

export function overlaySiteConfig(overrides: Partial<Record<string, string>>): PublicSite {
  return {
    ...siteConfig,
    tagline: overrides.tagline ?? siteConfig.tagline,
    phone: overrides.phone ?? siteConfig.phone,
    email: overrides.email ?? siteConfig.email,
    address: overrides.address ?? siteConfig.address,
    hours: overrides.hours ?? siteConfig.hours,
    whatsapp: overrides.whatsapp ?? siteConfig.whatsapp,
    social: {
      facebook: overrides.facebook ?? siteConfig.social.facebook,
      instagram: overrides.instagram ?? siteConfig.social.instagram,
      linkedin: overrides.linkedin ?? siteConfig.social.linkedin,
      youtube: overrides.youtube ?? siteConfig.social.youtube,
    },
  };
}

export function whatsappHref(prefill?: string, site: PublicSite = siteConfig) {
  const digits = site.whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  const text =
    prefill ||
    `Hello ${site.name}, I would like to learn more about opportunities abroad.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export const defaultDisclaimer =
  "Job placement and visa support are offered subject to eligibility, documentation, and applicable immigration requirements. Outcomes are not guaranteed.";

export const SETTING_KEYS = [
  "tagline",
  "phone",
  "email",
  "address",
  "hours",
  "whatsapp",
  "facebook",
  "instagram",
  "linkedin",
  "youtube",
] as const;
