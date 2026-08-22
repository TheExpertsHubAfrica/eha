import { siteConfig } from "@/lib/site-config";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/apply", "/api", "/application"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
