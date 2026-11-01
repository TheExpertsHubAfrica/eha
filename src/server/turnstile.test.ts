import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { verifyTurnstile } from "./turnstile";

const realFetch = globalThis.fetch;
const realError = console.error;
let requests: Record<string, unknown>[] = [];

function respondWith(body: unknown) {
  globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
    requests.push(JSON.parse(String(init?.body)));
    return new Response(JSON.stringify(body), { status: 200 });
  }) as typeof fetch;
}

describe("verifyTurnstile", () => {
  beforeEach(() => {
    requests = [];
    process.env.TURNSTILE_SECRET_KEY = "secret";
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site";
    console.error = () => undefined;
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    console.error = realError;
    delete process.env.TURNSTILE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  });

  it("is skipped until both keys are set", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    assert.equal(await verifyTurnstile(undefined, "1.1.1.1", "contact"), true);
    process.env.TURNSTILE_SECRET_KEY = "secret";
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    assert.equal(await verifyTurnstile(undefined, "1.1.1.1", "contact"), true);
  });

  it("rejects missing, malformed and oversized tokens without calling Cloudflare", async () => {
    respondWith({ success: true });
    for (const token of [undefined, null, "", 42, {}, "x".repeat(2049)]) {
      assert.equal(await verifyTurnstile(token, "1.1.1.1", "contact"), false);
    }
    assert.equal(requests.length, 0);
  });

  it("accepts a valid token and sends the secret, token and IP", async () => {
    respondWith({ success: true, action: "contact" });
    assert.equal(await verifyTurnstile("tok", "1.1.1.1", "contact"), true);
    assert.deepEqual(requests[0], { secret: "secret", response: "tok", remoteip: "1.1.1.1" });
  });

  it("omits an unknown IP", async () => {
    respondWith({ success: true, action: "contact" });
    await verifyTurnstile("tok", "unknown", "contact");
    assert.equal("remoteip" in requests[0], false);
  });

  it("rejects a token issued for a different form", async () => {
    respondWith({ success: true, action: "resume_link" });
    assert.equal(await verifyTurnstile("tok", "1.1.1.1", "contact"), false);
  });

  it("accepts the empty action that test keys return", async () => {
    respondWith({ success: true, action: "" });
    assert.equal(await verifyTurnstile("tok", "1.1.1.1", "contact"), true);
  });

  it("rejects bad, expired and reused tokens", async () => {
    for (const code of ["invalid-input-response", "timeout-or-duplicate", "missing-input-response"]) {
      respondWith({ success: false, "error-codes": [code] });
      assert.equal(await verifyTurnstile("tok", "1.1.1.1", "contact"), false, code);
    }
  });

  it("allows the request when the fault is ours or Cloudflare's", async () => {
    for (const code of ["invalid-input-secret", "missing-input-secret", "internal-error", "bad-request"]) {
      respondWith({ success: false, "error-codes": [code] });
      assert.equal(await verifyTurnstile("tok", "1.1.1.1", "contact"), true, code);
    }
    respondWith({ success: false });
    assert.equal(await verifyTurnstile("tok", "1.1.1.1", "contact"), true);
  });

  it("allows the request when Cloudflare is unreachable or returns junk", async () => {
    globalThis.fetch = (async () => {
      throw new Error("network down");
    }) as typeof fetch;
    assert.equal(await verifyTurnstile("tok", "1.1.1.1", "contact"), true);
    globalThis.fetch = (async () => new Response("<html>", { status: 502 })) as typeof fetch;
    assert.equal(await verifyTurnstile("tok", "1.1.1.1", "contact"), true);
  });
});
