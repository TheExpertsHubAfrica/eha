import { prisma } from "@/server/db";

function startOfDayUtc(daysAgo: number) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date;
}

export async function loadAnalytics() {
  const since = startOfDayUtc(29);
  const weekStart = startOfDayUtc(6);
  const abandonedCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    statusGroups,
    submittedSince,
    newDrafts,
    started,
    withPersonal,
    withDocuments,
    submitted,
    expiredDrafts,
    staleDrafts,
    missingDocsSubmitted,
    jobViews,
    applyStarts,
    jobSubmitted,
    dailySubmitted,
    publishedJobs,
    publishedTravel,
    publishedStudy,
    paymentsSuccessAll,
    paymentsSuccessWeek,
    paymentsPending,
    applicationsPaid,
    dailyPayments,
  ] = await Promise.all([
    prisma.application.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.application.count({
      where: { status: { not: "draft" }, submittedAt: { gte: weekStart } },
    }),
    prisma.application.count({
      where: { createdAt: { gte: weekStart } },
    }),
    prisma.application.count(),
    prisma.application.count({ where: { stepsCompleted: { has: "personal" } } }),
    prisma.application.count({ where: { stepsCompleted: { has: "documents" } } }),
    prisma.application.count({ where: { status: { not: "draft" } } }),
    prisma.application.count({
      where: { status: "draft", expiresAt: { lte: new Date() } },
    }),
    prisma.application.count({
      where: {
        status: "draft",
        updatedAt: { lte: abandonedCutoff },
        expiresAt: { gt: new Date() },
      },
    }),
    prisma.application.count({
      where: {
        status: { not: "draft" },
        documents: { none: {} },
      },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["targetId"],
      where: { name: "job_viewed", targetId: { not: null }, createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["targetId"],
      where: { name: "application_started", targetId: { not: null }, createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.application.groupBy({
      by: ["jobId"],
      where: { status: { not: "draft" } },
      _count: { _all: true },
    }),
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', submitted_at) AS day, count(*)::bigint AS count
      FROM applications
      WHERE submitted_at IS NOT NULL AND submitted_at >= ${since}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.job.count({ where: { status: "published" } }),
    prisma.travelPackage.count({ where: { status: "published" } }),
    prisma.studyOpportunity.count({ where: { status: "published" } }),
    prisma.payment.aggregate({
      where: { status: "success" },
      _count: { _all: true },
      _sum: { amountPesewas: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: "success",
        OR: [{ paidAt: { gte: weekStart } }, { paidAt: null, createdAt: { gte: weekStart } }],
      },
      _count: { _all: true },
      _sum: { amountPesewas: true },
    }),
    prisma.payment.count({ where: { status: "pending" } }),
    prisma.application.count({
      where: {
        status: { not: "draft" },
        payments: { some: { status: "success" } },
      },
    }),
    prisma.$queryRaw<{ day: Date; count: bigint; total: bigint }[]>`
      SELECT date_trunc('day', coalesce(paid_at, created_at)) AS day,
             count(*)::bigint AS count,
             coalesce(sum(amount_pesewas), 0)::bigint AS total
      FROM payments
      WHERE status = 'success'
        AND coalesce(paid_at, created_at) >= ${since}
      GROUP BY 1
      ORDER BY 1
    `,
  ]);

  const jobs = await prisma.job.findMany({
    select: { id: true, title: true, city: true, country: true },
  });
  const jobMap = Object.fromEntries(jobs.map((job) => [job.id, job]));

  const countByStatus = Object.fromEntries(
    statusGroups.map((row) => [row.status, row._count._all]),
  );

  const viewsByJob = Object.fromEntries(
    jobViews.map((row) => [row.targetId ?? "", row._count._all]),
  );
  const startsByJob = Object.fromEntries(
    applyStarts.map((row) => [row.targetId ?? "", row._count._all]),
  );

  const byCountry = new Map<string, number>();
  for (const row of jobSubmitted) {
    const country = jobMap[row.jobId]?.country ?? "Unknown";
    byCountry.set(country, (byCountry.get(country) ?? 0) + row._count._all);
  }

  const days: { label: string; value: number }[] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const date = startOfDayUtc(i);
    const key = date.toISOString().slice(0, 10);
    const found = dailySubmitted.find((row) => {
      const day = row.day instanceof Date ? row.day : new Date(row.day);
      return day.toISOString().slice(0, 10) === key;
    });
    days.push({
      label: key.slice(5),
      value: found ? Number(found.count) : 0,
    });
  }

  const paymentDays: { label: string; value: number }[] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const date = startOfDayUtc(i);
    const key = date.toISOString().slice(0, 10);
    const found = dailyPayments.find((row) => {
      const day = row.day instanceof Date ? row.day : new Date(row.day);
      return day.toISOString().slice(0, 10) === key;
    });
    paymentDays.push({
      label: key.slice(5),
      value: found ? Number(found.total) / 100 : 0,
    });
  }

  const jobPerformance = jobs
    .map((job) => {
      const views = viewsByJob[job.id] ?? 0;
      const startedCount = startsByJob[job.id] ?? 0;
      const applied = jobSubmitted.find((row) => row.jobId === job.id)?._count._all ?? 0;
      return {
        id: job.id,
        title: job.title,
        city: job.city,
        views,
        started: startedCount,
        applied,
        conversion: views > 0 ? applied / views : 0,
      };
    })
    .filter((row) => row.views > 0 || row.started > 0 || row.applied > 0)
    .sort((a, b) => b.applied - a.applied || b.views - a.views)
    .slice(0, 10);

  const completionRate = started > 0 ? submitted / started : 0;
  const documentRate = submitted > 0 ? (submitted - missingDocsSubmitted) / submitted : 0;
  const paidRate = submitted > 0 ? applicationsPaid / submitted : 0;

  return {
    countByStatus,
    cards: {
      total: started,
      newThisWeek: submittedSince,
      underReview: countByStatus.under_review ?? 0,
      shortlisted: countByStatus.shortlisted ?? 0,
      approved: countByStatus.approved ?? 0,
      rejected: countByStatus.rejected ?? 0,
      publishedJobs,
      publishedTravel,
      publishedStudy,
      draftsStartedWeek: newDrafts,
      paymentsSuccessCount: paymentsSuccessAll._count._all,
      paymentsSuccessTotalPesewas: paymentsSuccessAll._sum.amountPesewas ?? 0,
      paymentsSuccessWeekCount: paymentsSuccessWeek._count._all,
      paymentsSuccessWeekPesewas: paymentsSuccessWeek._sum.amountPesewas ?? 0,
      paymentsPending: paymentsPending,
      applicationsPaid,
    },
    funnel: [
      { label: "Started", value: started },
      { label: "Personal complete", value: withPersonal },
      { label: "Documents complete", value: withDocuments },
      { label: "Submitted", value: submitted },
    ],
    days,
    paymentDays,
    byStatus: statusGroups
      .map((row) => ({ label: row.status.replaceAll("_", " "), value: row._count._all }))
      .sort((a, b) => b.value - a.value),
    byCountry: [...byCountry.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value),
    jobPerformance,
    completionRate,
    documentRate,
    paidRate,
    abandoned: expiredDrafts + staleDrafts,
    mostViewed: jobPerformance.slice().sort((a, b) => b.views - a.views).slice(0, 5),
  };
}
