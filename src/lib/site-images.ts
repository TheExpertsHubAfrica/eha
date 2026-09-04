export const siteImages = {
  home: {
    hero: "/images/home/hero.png",
    pathwayWork: "/images/work/cover-07.jpeg",
    pathwayStudy: "/images/home/pathway-study.jpg",
    pathwayTravel: "/images/home/pathway-travel.jpg",
    trustTexture: "/images/home/trust-texture.jpg",
    finalCta: "/images/home/final-cta.jpg",
  },
  work: {
    hero: "/images/home/hero.png",
    empty: "/images/work/empty.jpg",
    covers: [
      "/images/work/cover-01.jpg",
      "/images/work/cover-02-new.jpeg",
      "/images/work/cover-03.jpg",
      "/images/work/cover-04.jpg",
      "/images/work/cover-05.jpg",
      "/images/work/cover-06.jpg",
      "/images/work/cover-07.jpeg",
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
    destinations: {
      canada: "/images/study/destinations/canada.jpg",
      unitedStates: "/images/study/destinations/united-states.jpg",
      unitedKingdom: "/images/study/destinations/united-kingdom.jpg",
      schengen: "/images/study/destinations/schengen.jpg",
    },
  },
  about: {
    team: "/images/about/team.jpg",
    process: "/images/about/process.jpg",
    princeOkoampah: "/images/about/Prince-Okoampah.jpg",
    gyanBimpong: "/images/about/Stephen-Gyan.jpg",
    jenniferDorh: "/images/about/Jennifer-Dorh.jpg",
  },
  services: {
    hero: "/images/services/hero.jpg",
    work: "/images/services/work.jpg",
    study: "/images/services/study.jpg",
    travel: "/images/services/travel.jpg",
    visa: "/images/services/visa.jpg",
  },
  contact: {
    hero: "/images/study/support.jpg",
    aside: "/images/about/team.jpg",
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

const jobCoverOverrides: Record<string, string> = {
  job_sales_assistant_dubai: "/images/work/cover-05.jpg",
  "sales-assistant": "/images/work/cover-05.jpg",
};

const categoryCovers: Record<string, (typeof siteImages.work.covers)[number]> = {
  Hospitality: "/images/work/cover-01.jpg",
  Manufacturing: "/images/work/cover-02-new.jpeg",
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

export function workCoverForJob(job: { id: string; category: string; slug?: string }) {
  const byJob = jobCoverOverrides[job.id] ?? (job.slug ? jobCoverOverrides[job.slug] : undefined);
  if (byJob) return byJob;

  const byCategory = categoryCovers[job.category];
  if (byCategory) return byCategory;

  return siteImages.work.covers[hashJobId(job.id) % siteImages.work.covers.length];
}
