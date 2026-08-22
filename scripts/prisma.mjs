import { spawn } from "node:child_process";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. In .env.local, add an uncommented line:\nDATABASE_URL=\"postgresql://...?sslmode=require\"",
  );
  process.exit(1);
}

const child = spawn("npx", ["prisma", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
