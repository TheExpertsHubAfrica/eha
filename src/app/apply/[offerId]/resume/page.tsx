import { redirect } from "next/navigation";
import { resumeApplicationAction } from "@/server/application/actions";

export const dynamic = "force-dynamic";

export default async function ResumeApplicationPage({
  params,
  searchParams,
}: {
  params: Promise<{ offerId: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { offerId } = await params;
  const query = await searchParams;
  const token = query.t?.trim();
  if (!token) {
    redirect(`/apply/${offerId}?resume=invalid`);
  }
  await resumeApplicationAction(offerId, token);
}
