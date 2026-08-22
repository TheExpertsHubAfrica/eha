import { type PublicSite, whatsappHref } from "@/lib/site-config";

export function WhatsAppCta({ site }: { site: PublicSite }) {
  const href = whatsappHref(undefined, site);
  if (!href) return null;

  return (
    <a
      href={href}
      className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full bg-[#128C7E] px-4 py-3 text-sm font-medium text-white hover:bg-[#0e7a6e] sm:right-6 sm:bottom-6"
      rel="noopener noreferrer"
      target="_blank"
    >
      <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
        <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.55 2 2.08 6.46 2.08 11.94c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.78 1.22h.01c5.49 0 9.96-4.46 9.96-9.94a9.84 9.84 0 0 0-2.95-7zM12.04 20.15h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.35c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.55-3.7 8.2-8.23 8.2zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.8-.79.97-.15.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.45-1.37-1.7-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.65.31-.22.25-.86.83-.86 2.03s.88 2.35 1 2.52c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
      </svg>
      <span className="hidden sm:inline">Chat with {site.name}</span>
      <span className="sm:hidden">Chat</span>
    </a>
  );
}
