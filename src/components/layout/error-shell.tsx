"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

/**
 * Client-only shell for error.tsx — must not import Prisma / server modules.
 */
export function ErrorShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="border-b border-border bg-white">
        <div className="container-wide flex h-[72px] items-center">
          <Logo background="light" priority />
        </div>
      </header>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border bg-black px-4 py-6 text-center text-sm text-white/70">
        {siteConfig.name}
      </footer>
    </div>
  );
}
