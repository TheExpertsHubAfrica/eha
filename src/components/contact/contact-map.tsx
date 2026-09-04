const ACCRA = {
  lat: 5.6037,
  lng: -0.187,
  label: "Accra, Ghana",
  zoom: 13,
} as const;

/** Classic Google Maps embed — works without WebGL on most phones and browsers. */
function googleMapsEmbedSrc() {
  const query = encodeURIComponent(`${ACCRA.lat},${ACCRA.lng}`);
  return `https://maps.google.com/maps?q=${query}&z=${ACCRA.zoom}&hl=en&output=embed`;
}

function googleMapsHref() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${ACCRA.lat},${ACCRA.lng}(${ACCRA.label})`,
  )}`;
}

export function ContactMap({ address }: { address?: string }) {
  return (
    <section className="border-t border-border bg-surface">
      <div className="container-page py-12 sm:py-16">
        <p className="eyebrow">Location</p>
        <div className="gold-rule mt-3" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-bold text-black sm:text-3xl">Find us in Accra</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          {address?.trim()
            ? address
            : "The Experts Hub Africa is based in Accra, Ghana. Open the map for directions."}
        </p>

        <div className="relative mt-8 overflow-hidden border border-border bg-white">
          <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
            <iframe
              title="Google Map showing Accra, Ghana"
              src={googleMapsEmbedSrc()}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-border bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center bg-gold-soft text-gold-deep"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="size-4 fill-current" focusable="false">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-black">{ACCRA.label}</p>
                <p className="mt-0.5 text-xs text-muted">Pinned location on the map</p>
              </div>
            </div>
            <a
              href={googleMapsHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center justify-center bg-gold px-4 text-sm font-semibold text-black transition-colors hover:bg-gold-bright"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
