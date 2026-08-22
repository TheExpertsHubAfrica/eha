import { cache } from "react";
import { overlaySiteConfig, type PublicSite } from "@/lib/site-config";
import { prisma } from "@/server/db";

export const getResolvedSite = cache(async (): Promise<PublicSite> => {
  const rows = await prisma.siteSetting.findMany();
  const overlay = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return overlaySiteConfig(overlay);
});
