import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ObjectStorage } from "@/server/storage/types";

function rootDir() {
  return path.resolve(process.cwd(), "storage", "uploads");
}

function resolveSafe(key: string) {
  if (!key || key.includes("\0") || key.startsWith("/") || key.includes("\\")) {
    throw new Error("Invalid storage key.");
  }
  const root = rootDir();
  const dest = path.resolve(root, key);
  const relative = path.relative(root, dest);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Invalid storage key.");
  }
  return { root, dest };
}

export const localStorageDriver: ObjectStorage = {
  async put(key, body) {
    const { dest } = resolveSafe(key);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, body);
  },
  async get(key) {
    const { dest } = resolveSafe(key);
    return readFile(dest);
  },
  async delete(key) {
    const { dest } = resolveSafe(key);
    await unlink(dest).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
  },
};
