import { cache } from "react";
import { prisma } from "@/server/db";

export const getPublishedFaqs = cache(async () => {
  return prisma.faqItem.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
});

export const getPublishedPosts = cache(async () => {
  return prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
});

export const getPublishedPost = cache(async (slug: string) => {
  return prisma.blogPost.findFirst({
    where: { slug, status: "published" },
  });
});

export const getLegalPage = cache(async (slug: string) => {
  return prisma.legalPage.findUnique({ where: { slug } });
});
