import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { footerNav } from "@/lib/navigation";
import { type PublicSite } from "@/lib/site-config";

function Column({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold tracking-wide text-gold-bright">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={`${title}-${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className="text-sm text-white/70 hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const socialLabels = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
} as const;

export function SiteFooter({ site }: { site: PublicSite }) {
  const socials = Object.entries(site.social).filter(([, url]) => url);

  return (
    <footer className="bg-black text-white">
      <div className="h-0.5 bg-linear-to-r from-gold via-gold-bright to-transparent" aria-hidden="true" />
      <div className="container-wide grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <div className="inline-flex bg-white px-3 py-2.5">
            <Logo background="light" />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            {site.tagline}
          </p>
          <ul className="mt-6 space-y-2 text-sm text-white/75">
            {site.phone ? (
              <li>
                <a href={`tel:${site.phone.replace(/\s/g, "")}`}>
                  {site.phone}
                </a>
              </li>
            ) : null}
            {site.email ? (
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
            ) : null}
            {site.address ? <li>{site.address}</li> : null}
          </ul>
          {socials.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-3">
              {socials.map(([key, url]) => (
                <li key={key}>
                  <a
                    href={url}
                    className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {socialLabels[key as keyof typeof socialLabels]}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <Column title="Company" links={footerNav.company} />
        <Column title="Opportunities" links={footerNav.opportunities} />
        <Column title="Services" links={footerNav.services} />
        <div className="space-y-10">
          <Column title="Support" links={footerNav.support} />
          <Column title="Legal" links={footerNav.legal} />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-wide flex flex-col gap-2 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>Documents and identity data are collected only during an application.</p>
        </div>
      </div>
    </footer>
  );
}
