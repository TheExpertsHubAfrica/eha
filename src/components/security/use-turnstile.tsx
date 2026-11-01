"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptLoading: Promise<TurnstileApi> | null = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptLoading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile missing")));
    script.onerror = () => {
      // Forget the failure so that Try again can load the script from scratch.
      script.remove();
      scriptLoading = null;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(script);
  });
  return scriptLoading;
}

/** Does nothing until the site key is set, so forms keep working in development and before launch. */
export function useTurnstile(action: string, active = true) {
  const enabled = Boolean(SITE_KEY) && active;
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !container.current) return;
        widgetId.current = turnstile.render(container.current, {
          sitekey: SITE_KEY,
          action,
          size: "flexible",
          theme: "light",
          "response-field": false,
          callback: (value: string) => {
            setToken(value);
            setFailed(false);
          },
          "expired-callback": () => setToken(""),
          "timeout-callback": () => setToken(""),
          "error-callback": () => {
            setToken("");
            setFailed(true);
            return true;
          },
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [enabled, action, attempt]);

  /** Tokens are single-use, so call this after any attempt that did not move the visitor on. */
  const reset = useCallback(() => {
    setToken("");
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }, []);

  const retry = useCallback(() => {
    setToken("");
    setFailed(false);
    setAttempt((value) => value + 1);
  }, []);

  const widget = enabled ? (
    <div>
      <div ref={container} className="min-h-[65px]" />
      {failed ? (
        <div className="mt-2 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
          <p>
            The security check could not load. Check your connection or turn off any content blocker,
            then try again. Your answers are kept.
          </p>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={retry}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  ) : null;

  return { enabled, token, reset, widget };
}
