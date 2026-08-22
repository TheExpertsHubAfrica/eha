"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { mainNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="container-wide flex h-[72px] items-center justify-between gap-4">
        <Logo background="light" priority />
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary"
        >
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-2.5 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase xl:px-3",
                isActive(pathname, item.href)
                  ? "text-black"
                  : "text-fg-soft hover:text-black",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden uppercase tracking-[0.08em] sm:inline-flex">
            <Link href="/work-abroad">Apply Now</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent title="Menu">
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-sm px-3 py-3 text-[13px] font-semibold tracking-[0.08em] uppercase",
                      isActive(pathname, item.href)
                        ? "bg-black text-white"
                        : "text-black hover:bg-surface",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <Button asChild className="mt-8 w-full uppercase tracking-[0.08em]" size="lg">
                <Link href="/work-abroad" onClick={() => setOpen(false)}>
                  Apply Now
                </Link>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
