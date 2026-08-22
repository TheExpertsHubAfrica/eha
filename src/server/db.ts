import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function clientKnowsDocuments(client: PrismaClient) {
  const fields = (
    client as unknown as {
      _runtimeDataModel?: {
        models?: Record<string, { fields?: { name: string }[] }>;
      };
    }
  )._runtimeDataModel?.models?.Application?.fields;
  if (!fields) return true;
  return fields.some((field) => field.name === "documents");
}

function clientKnowsAdmin(client: PrismaClient) {
  return Boolean(
    (
      client as unknown as {
        adminUser?: unknown;
      }
    ).adminUser,
  );
}

function getClient() {
  const existing = globalForPrisma.prisma;
  if (existing && clientKnowsDocuments(existing) && clientKnowsAdmin(existing)) {
    return existing;
  }
  if (existing) {
    void existing.$disconnect();
  }
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getClient();
