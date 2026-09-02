#!/usr/bin/env node
/**
 * Generate corporate PDF documents from HTML sources.
 * Uses Chrome headless (macOS) — no extra dependencies required.
 *
 * Usage: npm run generate:proposals
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const corporateDir = path.join(root, "docs/corporate");
const outputDir = path.join(corporateDir, "output");

const documents = [
  { html: "partnership-proposal.html", pdf: "TEHA-Partnership-Proposal.pdf" },
  { html: "referral-system-specification.html", pdf: "TEHA-Referral-System-Specification.pdf" },
];

const chromePaths = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

function findChrome() {
  return chromePaths.find((p) => fs.existsSync(p));
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function generatePdf(chrome, doc) {
  const htmlPath = path.join(corporateDir, doc.html);
  const pdfPath = path.join(outputDir, doc.pdf);
  const fileUrl = `file://${htmlPath.replace(/ /g, "%20")}`;

  await run(chrome, [
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${pdfPath}`,
    fileUrl,
  ]);
  console.log(`✓ ${doc.pdf}`);
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const chrome = findChrome();
  if (!chrome) {
    console.error("Chrome/Chromium not found. Open the HTML files manually and Print → Save as PDF:\n");
    for (const doc of documents) {
      console.error(`  docs/corporate/${doc.html}`);
    }
    process.exit(1);
  }

  for (const doc of documents) {
    await generatePdf(chrome, doc);
  }
  console.log(`\nPDFs saved to: ${outputDir}`);
}

main().catch((error) => {
  console.error("\nPDF generation failed:", error.message);
  process.exit(1);
});
