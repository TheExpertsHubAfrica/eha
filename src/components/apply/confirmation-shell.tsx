import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/lib/site-config";
import type { ReactNode } from "react";

export function ConfirmationShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-surface">
      <header className="border-b border-border bg-white print:hidden">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Logo />
          <Link href="/" className="text-sm font-medium text-blue">
            {siteConfig.shortName} home
          </Link>
        </div>
      </header>
      <main id="main-content" className="flex-1">
        <div className="container-page py-8 sm:py-10">{children}</div>
      </main>
    </div>
  );
}
