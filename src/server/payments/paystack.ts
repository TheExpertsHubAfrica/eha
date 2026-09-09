import { siteConfig } from "@/lib/site-config";

export function paystackConfigured() {
  return Boolean(
    process.env.PAYSTACK_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim(),
  );
}

export function paystackSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  return key;
}

export function paystackPublicKey() {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim() || "";
}

export { ghsToPesewas, pesewasToGhs, formatGhs } from "@/lib/money";

type PaystackInitResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at?: string | null;
    customer?: { email?: string };
  };
};

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${paystackSecretKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const body = (await response.json()) as T;
  if (!response.ok) {
    const message =
      typeof body === "object" && body && "message" in body
        ? String((body as { message?: string }).message)
        : `Paystack request failed (${response.status}).`;
    throw new Error(message);
  }
  return body;
}

export async function initializePaystackTransaction(input: {
  email: string;
  amountPesewas: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  const payload = await paystackFetch<PaystackInitResponse>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amountPesewas,
      currency: "GHS",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: {
        ...input.metadata,
        site: siteConfig.name,
      },
    }),
  });
  if (!payload.status || !payload.data) {
    throw new Error(payload.message || "Could not start Paystack payment.");
  }
  return payload.data;
}

export async function verifyPaystackTransaction(reference: string) {
  const payload = await paystackFetch<PaystackVerifyResponse>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
  if (!payload.status || !payload.data) {
    throw new Error(payload.message || "Could not verify Paystack payment.");
  }
  return payload.data;
}

export function buildPaystackReference(prefix: string) {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}_${stamp}_${rand}`.slice(0, 50);
}
