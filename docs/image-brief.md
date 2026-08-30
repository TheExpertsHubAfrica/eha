# TEHA image brief

Recommended photography and brand assets to finish the public site. Replace abstract SVG panels and empty media slots with real imagery that matches the **black · ash · brushed gold** system.

**Style notes (all shots)**
- Prefer natural light, calm composition, professional but warm — not stock “handshake” clichés.
- Colour grade toward ash neutrals; let gold appear in details (metal, light, fabric), not heavy filters.
- Avoid heavy purple/teal cinematic looks; keep contrast readable on light ash surfaces.
- Deliver WebP + JPEG where possible; keep masters as high-res PNG/TIFF for logo work.
- Filenames below are relative to `public/` unless noted.

**Alt text tips**
- Use the **Suggested alt text** column when wiring images into the site (`alt` attribute, Open Graph `alt`, CMS fields).
- Lead with *what is in the image*, then *why it matters* — include destination, service, or role where relevant.
- Keep alt text under ~125 characters when possible; avoid “image of” or keyword stuffing.

---

## 1. Brand & system

| Asset | Proposed filename | Spec | Image brief | Suggested alt text |
|-------|-------------------|------|-------------|-------------------|
| **Logo — black** | `brand/logo-black.svg`, `brand/logo-black.png` | SVG + PNG @2x/3x, transparent | Primary TEHA wordmark for light backgrounds: header, cards, PDFs, admin light UI. | The Experts Hub Africa (TEHA) logo in black on a transparent background |
| **Logo — white** | `brand/logo-white.svg`, `brand/logo-white.png` | SVG + PNG @2x/3x, transparent | White wordmark for dark sections: footer, trust band, admin sidebar. | The Experts Hub Africa (TEHA) logo in white on a transparent background |
| **App icon / favicon** | `brand/favicon.png`, `brand/icon-512.png` | 32×32 + 512×512 PNG | Square TEHA monogram or mark on black or brushed gold; readable at small sizes. | TEHA app icon — The Experts Hub Africa |
| **Open Graph / social share** | `brand/og-default.jpg` | 1200×630 | Branded share card: TEHA name, “Work · Travel · Study”, ash/black background, gold accent line. | The Experts Hub Africa — work abroad, travel packages and study abroad opportunities |
| **Email header (optional)** | `brand/email-header.png` | 600×120 | Horizontal logo lockup for transactional email (application updates, contact replies). | The Experts Hub Africa email header logo |

---

## 2. Homepage

| Asset | Proposed filename | Spec | Image brief | Suggested alt text |
|-------|-------------------|------|-------------|-------------------|
| **Hero primary** | `images/home/hero.jpg` | 1600×1200 (or 2400×1350) | Young professional or traveller at an international airport, city viewpoint, or campus — aspirational but realistic. Replaces homepage SVG illustration. | International work, travel and study opportunities abroad with The Experts Hub Africa |
| **Pathway — Work** | `images/home/pathway-work.jpg` | 1200×900 | Overseas workplace context: hotel lobby, warehouse, healthcare facility, or city business district — communicates *jobs abroad*. | Work abroad jobs and overseas employment opportunities |
| **Pathway — Study** | `images/home/pathway-study.jpg` | 1200×900 | University campus, library, or international student city — reads clearly as *study abroad*. | Study abroad programs and international university pathways |
| **Pathway — Travel** | `images/home/pathway-travel.jpg` | 1200×900 | Curated destination scene: skyline, old town street, or coastal view — premium travel, not busy tourist collage. | Curated international travel packages and holiday destinations |
| **Trust / “why us” texture (optional)** | `images/home/trust-texture.jpg` | 2400×1200 soft texture | Very subtle ash stone, linen, or architecture texture for dark section overlay; must not compete with white text. | *(Decorative background — use empty alt `""` or omit from accessibility tree)* |
| **Final CTA band (optional)** | `images/home/final-cta.jpg` | 2000×800 | Soft-focus horizon, airport corridor, or city at dusk — muted so CTA text stays readable. | Explore work, travel and study abroad with TEHA |

---

## 3. Work abroad

| Asset | Proposed filename | Spec | Image brief | Suggested alt text |
|-------|-------------------|------|-------------|-------------------|
| **Work listing hero** | `images/work/hero.jpg` | 2000×900 | Wide hero for `/work-abroad`: international workforce, modern workplace exterior, or professional in work attire abroad. | Browse overseas jobs and work abroad opportunities with TEHA |
| **Empty state illustration** | `images/work/empty.jpg` | 800×600 | Branded empty state when no roles are published — minimal gold/ash graphic, no misleading job imagery. | No current work abroad job listings available |
| **Generic job cover 01** | `images/work/cover-01.jpg` | 1600×900 | Hospitality or service sector abroad — hotel, restaurant, or guest-facing role setting. | Hospitality and service jobs abroad — overseas employment |
| **Generic job cover 02** | `images/work/cover-02.jpg` | 1600×900 | Logistics, warehouse, or industrial workplace overseas. | Logistics and warehouse jobs abroad |
| **Generic job cover 03** | `images/work/cover-03.jpg` | 1600×900 | Healthcare or caregiving workplace context (uniforms, clinic, care setting). | Healthcare and caregiving jobs overseas |
| **Generic job cover 04** | `images/work/cover-04.jpg` | 1600×900 | Office or skilled trade setting in an international city. | Skilled and professional jobs abroad |
| **Per-job cover (CMS)** | `images/work/jobs/{job-slug}.jpg` | 1600×900 each | Role-specific cover: city + workplace that matches the listing (e.g. Dubai hotel attendant → hotel exterior in Dubai). | `{Job title} work abroad job in {city}, {country}` — e.g. *Hotel attendant work abroad job in Dubai, UAE* |

---

## 4. Travel packages

| Asset | Proposed filename | Spec | Image brief | Suggested alt text |
|-------|-------------------|------|-------------|-------------------|
| **Travel index hero** | `images/travel/hero.jpg` | 2000×900 | Panoramic travel destination — recognisable skyline or landscape that sells *international holiday packages*. | International travel packages and curated holiday destinations |
| **Package cover (per slug)** | `images/travel/packages/{package-slug}.jpg` | 1600×900 each | Hero photo for one package: iconic view of that destination (skyline, desert, waterfront, old town). | `{Package name} travel package — {destination}, {country}` — e.g. *Dubai city escape travel package — Dubai, UAE* |
| **Package gallery 01** | `images/travel/packages/{package-slug}-01.jpg` | 1600×1000 | Landmark or street scene from the package destination. | `{Destination} landmark and city sights on TEHA travel package` |
| **Package gallery 02** | `images/travel/packages/{package-slug}-02.jpg` | 1600×1000 | Local food, market, or cultural moment — authentic, not staged tourist cliché. | Local culture and dining experiences on {destination} travel package |
| **Package gallery 03** | `images/travel/packages/{package-slug}-03.jpg` | 1600×1000 | Landscape, beach, desert, or night skyline — itinerary mood shot. | Scenic views and highlights of {destination} holiday package |

---

## 5. Study abroad

| Asset | Proposed filename | Spec | Image brief | Suggested alt text |
|-------|-------------------|------|-------------|-------------------|
| **Study index hero** | `images/study/hero.jpg` | 2000×900 | International university campus, student quarter, or library — welcoming, academic, global. | Study abroad programs and international education pathways |
| **Destination cover (per slug)** | `images/study/destinations/{destination-slug}.jpg` | 1600×900 each | Campus gate, city library, or skyline for that study destination. | `Study abroad in {country} — university and education pathways` — e.g. *Study abroad in the United Kingdom — university pathways* |
| **Support strip (optional)** | `images/study/support.jpg` | 1600×700 | Adviser and student at a desk with laptop and folders — no readable passport or personal data on screen. | Study abroad admission and visa document guidance from TEHA |

---

## 6. About, services, contact

| Asset | Proposed filename | Spec | Image brief | Suggested alt text |
|-------|-------------------|------|-------------|-------------------|
| **About — team or office** | `images/about/team.jpg` | 1600×1000 | TEHA team in office or at a professional meet-up — real people, diverse, approachable. | The Experts Hub Africa team providing work, travel and study abroad support |
| **About — process** | `images/about/process.jpg` | 1200×800 | Organised desk: closed passport, checklist, laptop — reinforces secure, step-by-step applications. | Guided job and study abroad application process with document support |
| **Services — Work** | `images/services/work.jpg` | 1000×750 | Overseas employment / recruitment support visual — workplace or applicant preparing for abroad role. | Overseas job placement and work abroad application services |
| **Services — Study** | `images/services/study.jpg` | 1000×750 | Student on campus or with study materials — admission and pathway support. | Study abroad assistance — admission and university application support |
| **Services — Travel** | `images/services/travel.jpg` | 1000×750 | Curated trip moment — suitcase, destination view, or group travel scene. | International travel packages and holiday booking services |
| **Services — Visa** | `images/services/visa.jpg` | 1000×750 | Passport and application documents on desk (no visible personal data) — visa guidance, not guarantees. | Visa assistance and document guidance for work and study abroad |
| **Contact — map or place** | `images/contact/place.jpg` | 1200×900 | TEHA office exterior, building entrance, or neighbourhood landmark if address is published. | The Experts Hub Africa office location — contact our team |

---

## 7. Blog & social proof

| Asset | Proposed filename | Spec | Image brief | Suggested alt text |
|-------|-------------------|------|-------------|-------------------|
| **Blog default cover** | `images/blog/default.jpg` | 1600×900 | Neutral branded cover: ash background, gold rule, subtle travel/study/work motif. | TEHA blog — advice on work abroad, travel and study overseas |
| **Blog post cover (per slug)** | `images/blog/posts/{post-slug}.jpg` | 1600×900 each | Visual that matches article topic (visa tips, CV prep, destination guide, etc.). | `{Article title}` — TEHA blog on work, travel and study abroad |
| **Author headshot (per person)** | `images/blog/authors/{author-slug}.jpg` | 400×400 | Professional headshot, neutral ash or white background, consistent crop. | `{Full name}, TEHA advisor and blog author` |
| **Testimonial portrait (per person)** | `images/testimonials/{person-slug}.jpg` | 320×320 | Consented applicant photo — friendly, professional; only if release is signed. | `{First name}, TEHA applicant testimonial` |

---

## 8. Apply & transactional UI

| Asset | Proposed filename | Spec | Image brief | Suggested alt text |
|-------|-------------------|------|-------------|-------------------|
| **Apply welcome / start** | `images/apply/start.jpg` | 1200×800 | Calm onboarding visual: person reviewing opportunity on laptop or phone — not celebratory. | Start your work abroad application with step-by-step guidance |
| **Success / confirmation** | `images/apply/success.jpg` | 1200×800 | Subtle completion moment — gold check motif or quiet “submitted” scene; reassuring tone. | Work abroad application submitted successfully — reference confirmation |
| **PDF work-profile header mark** | `brand/pdf-letterhead.png` (+ `.svg`) | 600×200 | High-contrast TEHA logo for downloadable work-profile PDF header. | The Experts Hub Africa — applicant work profile document |

---

## 9. Admin (light polish)

| Asset | Proposed filename | Spec | Image brief | Suggested alt text |
|-------|-------------------|------|-------------|-------------------|
| **Admin login atmosphere** | `images/admin/login-bg.jpg` | 1920×1080 muted | Soft ash/black texture or abstract architecture — no distracting photography. | *(Decorative background — use empty alt `""`)* |
| **Empty — no jobs** | `images/admin/empty-jobs.jpg` | 640×400 | Simple illustration: empty clipboard or briefcase in brand colours. | No job listings to display |
| **Empty — no travel** | `images/admin/empty-travel.jpg` | 640×400 | Simple illustration: suitcase or map outline in brand colours. | No travel packages to display |
| **Empty — no posts** | `images/admin/empty-blog.jpg` | 640×400 | Simple illustration: document or pen in brand colours. | No blog posts to display |

---

## Priority order (ship sequence)

1. `brand/logo-black.*` + `brand/logo-white.*` — confirm final art locked.
2. `images/home/hero.jpg` — highest visual impact.
3. `images/travel/packages/{slug}.jpg` + `images/study/destinations/{slug}.jpg`.
4. `brand/favicon.png` + `brand/og-default.jpg`.
5. `images/about/*` + `images/services/*`.
6. `images/blog/default.jpg` + post covers.
7. `images/apply/success.jpg` + `brand/pdf-letterhead.png`.

---

## Suggested file layout

```text
public/
  brand/
    logo-black.svg
    logo-black.png
    logo-white.svg
    logo-white.png
    favicon.png
    icon-512.png
    og-default.jpg
    email-header.png
    pdf-letterhead.svg
    pdf-letterhead.png
  images/
    home/
      hero.jpg
      pathway-work.jpg
      pathway-study.jpg
      pathway-travel.jpg
      trust-texture.jpg
      final-cta.jpg
    work/
      hero.jpg
      empty.jpg
      cover-01.jpg
      cover-02.jpg
      cover-03.jpg
      cover-04.jpg
      jobs/
        {job-slug}.jpg
    travel/
      hero.jpg
      packages/
        {package-slug}.jpg
        {package-slug}-01.jpg
        {package-slug}-02.jpg
        {package-slug}-03.jpg
    study/
      hero.jpg
      support.jpg
      destinations/
        {destination-slug}.jpg
    about/
      team.jpg
      process.jpg
    services/
      work.jpg
      study.jpg
      travel.jpg
      visa.jpg
    contact/
      place.jpg
    blog/
      default.jpg
      posts/
        {post-slug}.jpg
      authors/
        {author-slug}.jpg
    testimonials/
      {person-slug}.jpg
    apply/
      start.jpg
      success.jpg
    admin/
      login-bg.jpg
      empty-jobs.jpg
      empty-travel.jpg
      empty-blog.jpg
```

---

## Licensing & compliance checklist

- Prefer owned shoots or properly licensed stock (commercial use, no “editorial only”).
- No readable passport numbers, faces of minors, or unreleased client documents in any frame.
- Model releases for identifiable people used in marketing.
- Rename files to match proposed filenames before upload — search engines use filenames as a weak signal (`dubai-hotel-attendant-job.jpg` beats `IMG_4821.jpg`).
- When publishing, pair each image with its **Suggested alt text**; decorative-only backgrounds should use `alt=""`.
