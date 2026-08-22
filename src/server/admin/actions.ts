"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { verifyPassword } from "@/server/admin/password";
import {
  clearAdminSession,
  createAdminSession,
  loadAdminUser,
  writeAdminAudit,
} from "@/server/admin/auth";
import { prisma } from "@/server/db";
import { consumeLoginSlot } from "@/server/admin/rate-limit";
import { headers } from "next/headers";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  next: z.string().optional(),
});

export type AdminActionState = { ok: boolean; error?: string };

function nextPath(value?: string | null) {
  if (
    value?.startsWith("/admin") &&
    !value.startsWith("//") &&
    !value.startsWith("/admin/login")
  ) {
    return value;
  }
  return "/admin";
}

export async function loginAdminAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    next: String(formData.get("next") ?? "") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email and password." };
  }
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limited = consumeLoginSlot(`admin-login:${ip}:${parsed.data.email.toLowerCase()}`);
  if (!limited.ok) {
    return { ok: false, error: "Too many sign-in attempts. Try again shortly." };
  }
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 16) {
    return { ok: false, error: "AUTH_SECRET is not configured on this server." };
  }

  const user = await prisma.adminUser.findFirst({
    where: { email: parsed.data.email.toLowerCase(), active: true },
  });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { ok: false, error: "Those details did not match an admin account." };
  }

  await createAdminSession(user.id);
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await writeAdminAudit({
    actorId: user.id,
    action: "admin.login",
    targetType: "AdminUser",
    targetId: user.id,
  });
  redirect(nextPath(parsed.data.next));
}

export async function logoutAdminAction() {
  const user = await loadAdminUser();
  await clearAdminSession();
  if (user) {
    await writeAdminAudit({
      actorId: user.id,
      action: "admin.logout",
      targetType: "AdminUser",
      targetId: user.id,
    });
  }
  redirect("/admin/login");
}

export async function bootstrapAdminExists() {
  return (await prisma.adminUser.count()) > 0;
}
