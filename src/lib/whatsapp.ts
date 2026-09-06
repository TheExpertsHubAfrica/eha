import {
  type PublicSite,
  siteConfig,
  whatsappHref,
} from "@/lib/site-config";

const CAMPAIGN_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
  "ttclid",
  "msclkid",
] as const;

function one(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

/** True when the URL looks like paid / campaign traffic. */
export function isCampaignTraffic(
  params: Record<string, string | string[] | undefined>,
) {
  return CAMPAIGN_KEYS.some((key) => Boolean(one(params[key])?.trim()));
}

export function whatsappPrefillWorkAbroad(site: PublicSite = siteConfig) {
  return `Hello ${site.shortName}, I saw work abroad roles on theexperthubafrica.com and want to apply for a suitable offer. Please point me to the right job so I can submit my application online.`;
}

export function whatsappPrefillJob(
  job: { title: string; city: string; country: string; citySlug: string; slug: string },
  site: PublicSite = siteConfig,
) {
  const path = `https://theexperthubafrica.com/work-abroad/${job.citySlug}/${job.slug}`;
  return `Hello ${site.shortName}, I am interested in ${job.title} in ${job.city}, ${job.country} (${path}). I want to submit my application online — please confirm the next step if needed.`;
}

export function whatsappPrefillGeneral(site: PublicSite = siteConfig) {
  return `Hello ${site.name}, I would like to learn more about opportunities abroad.`;
}

export function workAbroadWhatsAppHref(site: PublicSite = siteConfig) {
  return whatsappHref(whatsappPrefillWorkAbroad(site), site);
}

export function jobWhatsAppHref(
  job: { title: string; city: string; country: string; citySlug: string; slug: string },
  site: PublicSite = siteConfig,
) {
  return whatsappHref(whatsappPrefillJob(job, site), site);
}
