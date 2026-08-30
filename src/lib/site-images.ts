export const siteImages = {
  home: {
    hero: "/images/home/hero.jpg",
    pathwayWork: "/images/home/pathway-work.jpg",
    pathwayStudy: "/images/home/pathway-study.jpg",
    pathwayTravel: "/images/home/pathway-travel.jpg",
    trustTexture: "/images/home/trust-texture.jpg",
    finalCta: "/images/home/final-cta.jpg",
  },
  work: {
    hero: "/images/work/hero.jpg",
    empty: "/images/work/empty.jpg",
    covers: [
      "/images/work/cover-01.jpg",
      "/images/work/cover-02.jpg",
      "/images/work/cover-03.jpg",
      "/images/work/cover-04.jpg",
      "/images/work/cover-05.jpg",
      "/images/work/cover-06.jpg",
    ] as const,
  },
  travel: {
    hero: "/images/travel/hero.jpg",
    empty: "/images/admin/empty-travel.jpg",
  },
  study: {
    hero: "/images/study/hero.jpg",
    support: "/images/study/support.jpg",
    empty: "/images/study/support.jpg",
  },
  about: {
    team: "/images/about/team.jpg",
    process: "/images/about/process.jpg",
  },
  services: {
    work: "/images/services/work.jpg",
    study: "/images/services/study.jpg",
    travel: "/images/services/travel.jpg",
    visa: "/images/services/visa.jpg",
  },
  contact: {
    place: "/images/contact/place.jpg",
  },
  blog: {
    default: "/images/blog/default.jpg",
  },
  apply: {
    start: "/images/apply/start.jpg",
    success: "/images/apply/success.jpg",
  },
  admin: {
    loginBg: "/images/admin/login-bg.jpg",
    emptyJobs: "/images/admin/empty-jobs.jpg",
    emptyTravel: "/images/admin/empty-travel.jpg",
    emptyBlog: "/images/admin/empty-blog.jpg",
  },
} as const;

const categoryCovers: Record<string, (typeof siteImages.work.covers)[number]> = {
  Hospitality: "/images/work/cover-01.jpg",
  Manufacturing: "/images/work/cover-02.jpg",
  Healthcare: "/images/work/cover-03.jpg",
  "Professional services": "/images/work/cover-04.jpg",
  Retail: "/images/work/cover-05.jpg",
  Security: "/images/work/cover-06.jpg",
};

function hashJobId(jobId: string) {
  let hash = 0;
  for (const char of jobId) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

export function workCoverForJob(job: { id: string; category: string }) {
  const byCategory = categoryCovers[job.category];
  if (byCategory) return byCategory;

  return siteImages.work.covers[hashJobId(job.id) % siteImages.work.covers.length];
}
