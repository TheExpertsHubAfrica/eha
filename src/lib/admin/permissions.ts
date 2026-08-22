import type { AdminRole } from "@prisma/client";

export type { AdminRole };

export type AdminPermission =
  | "dashboard.read"
  | "analytics.read"
  | "applications.read"
  | "applications.write"
  | "applications.documents"
  | "jobs.write"
  | "travel.write"
  | "study.write"
  | "content.write"
  | "settings.write"
  | "audit.read";

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    "dashboard.read",
    "analytics.read",
    "applications.read",
    "applications.write",
    "applications.documents",
    "jobs.write",
    "travel.write",
    "study.write",
    "content.write",
    "settings.write",
    "audit.read",
  ],
  admin: [
    "dashboard.read",
    "analytics.read",
    "applications.read",
    "applications.write",
    "applications.documents",
    "jobs.write",
    "travel.write",
    "study.write",
    "content.write",
    "settings.write",
    "audit.read",
  ],
  officer: [
    "dashboard.read",
    "analytics.read",
    "applications.read",
    "applications.write",
    "applications.documents",
  ],
  content: ["dashboard.read", "jobs.write", "travel.write", "study.write", "content.write"],
  analyst: ["dashboard.read", "analytics.read", "applications.read", "audit.read"],
};

export function rolePermissions(role: AdminRole): AdminPermission[] {
  return ROLE_PERMISSIONS[role];
}

export function can(role: AdminRole, permission: AdminPermission) {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function roleLabel(role: AdminRole) {
  const labels: Record<AdminRole, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    officer: "Application Officer",
    content: "Content Manager",
    analyst: "Analyst",
  };
  return labels[role];
}
