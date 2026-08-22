import { prisma } from "@/server/db";

export async function recordEvent(input: {
  name: string;
  targetType?: string;
  targetId?: string;
}) {
  await prisma.analyticsEvent.create({
    data: {
      name: input.name,
      targetType: input.targetType,
      targetId: input.targetId,
    },
  }).catch(() => undefined);
}
