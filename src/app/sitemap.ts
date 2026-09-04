import type { MetadataRoute } from "next";
import {
  getPublishedJobs,
  getPublishedStudy,
  getPublishedTravel,
  jobPath,
} from "@/lib/catalog";
import { siteConfig } from "@/lib/site-config";
import { getPublishedPosts } from "@/server/public-content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPaths = [
    "",
    "/work-abroad",
    "/travel",
    "/study-abroad",
    "/about",
    "/team",
    "/services",
    "/blog",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
    "/cookies",
  ];

  const [jobs, travel, study, posts] = await Promise.all([
    getPublishedJobs(),
    getPublishedTravel(),
    getPublishedStudy(),
    getPublishedPosts(),
  ]);

  const dynamicPaths = [
    ...jobs.map((job) => jobPath(job)),
    ...travel.map((item) => `/travel/${item.slug}`),
    ...study.map((item) => `/study-abroad/${item.slug}`),
    ...posts.map((post) => `/blog/${post.slug}`),
  ];

  return [...staticPaths, ...dynamicPaths].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
  }));
}
