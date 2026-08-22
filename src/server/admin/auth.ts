import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  signAdminToken,
  verifyAdminToken,
} from "@/lib/admin/session-token";
import { can, type AdminPermission } from "@/lib/admin/permissions";
import { prisma } from "@/server/db";

function authSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 16) return null;
  return secret;
}

export async function createAdminSession(userId: string) {
  const secret = authSecret();
  if (!secret) throw new Error("AUTH_SECRET is not configured.");
  const payload = JSON.stringify({
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE,
  });
  const token = await signAdminToken(payload, secret);
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
}

export async function readAdminUserId() {
  const secret = authSecret();
  if (!secret) return null;
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token, secret);
}

export async function loadAdminUser() {
  const userId = await readAdminUserId();
  if (!userId) return null;
  return prisma.adminUser.findFirst({
    where: { id: userId, active: true },
  });
}

export async function requireAdmin(permission?: AdminPermission) {
  const user = await loadAdminUser();
  if (!user) redirect("/admin/login");
  if (permission && !can(user.role, permission)) {
    redirect("/admin?denied=1");
  }
  return user;
}

export async function writeAdminAudit(input: {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorType: "admin",
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  }).catch(() => undefined);
}
