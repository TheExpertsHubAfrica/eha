import { chromium } from "playwright";

const pages = [
  { name: "Home", path: "/", captureId: "bb968a59-65d2-4b9a-a17c-27759904e2f0" },
  { name: "Work Abroad", path: "/work-abroad", captureId: "139c7b33-7228-44ec-aae2-8228a767c348" },
  { name: "Travel", path: "/travel", captureId: "0934ce7a-5007-4c48-862a-cdabbf54de07" },
  { name: "Study Abroad", path: "/study-abroad", captureId: "0a3f14a5-2316-4e51-ba3e-ea2dd43b75e2" },
  { name: "About", path: "/about", captureId: "cd675674-c158-4862-b605-5765ffba02b1" },
  { name: "Services", path: "/services", captureId: "55025ed4-6836-4753-9699-7fff972a9b67" },
  { name: "Contact", path: "/contact", captureId: "ea60fdc4-cebf-4fea-97cf-0c5ba9759c21" },
  { name: "Blog", path: "/blog", captureId: "0bf3fe0c-95f1-4bf1-9ba8-4fd7cfd6097c" },
  { name: "FAQ", path: "/faq", captureId: "cde59cb1-a1aa-4ce8-b0c8-bdc332e31240" },
];

const base = "http://localhost:3000";

function captureUrl(path, captureId) {
  const endpoint = encodeURIComponent(
    `https://mcp.figma.com/mcp/capture/${captureId}/submit?bindVariables=true`,
  );
  return `${base}${path}#figmacapture=${captureId}&figmaendpoint=${endpoint}&figmadelay=3000`;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const results = [];

for (const item of pages) {
  const url = captureUrl(item.path, item.captureId);
  console.log(`Capturing ${item.name}: ${item.path}`);
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
    await page.waitForTimeout(6000);
    const submitted = await page.evaluate(() => Boolean(window.__figmaCaptureSubmitted));
    results.push({ ...item, ok: true, submitted });
  } catch (error) {
    results.push({ ...item, ok: false, error: String(error) });
  }
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
