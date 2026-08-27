import { cache } from "react";
import { overlaySiteConfig, siteConfig, type PublicSite } from "@/lib/site-config";
import { prisma } from "@/server/db";

export const getResolvedSite = cache(async (): Promise<PublicSite> => {
  try {
    const rows = await prisma.siteSetting.findMany();
    const overlay = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    return overlaySiteConfig(overlay);
  } catch (error) {
    console.error("getResolvedSite: falling back to env site config", error);
    return siteConfig;
  }
});
