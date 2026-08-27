# TEHA image brief

Recommended photography and brand assets to finish the public site. Replace abstract SVG panels and empty media slots with real imagery that matches the **black · ash · brushed gold** system.

**Style notes (all shots)**
- Prefer natural light, calm composition, professional but warm — not stock “handshake” clichés.
- Colour grade toward ash neutrals; let gold appear in details (metal, light, fabric), not heavy filters.
- Avoid heavy purple/teal cinematic looks; keep contrast readable on light ash surfaces.
- Deliver WebP + JPEG where possible; keep masters as high-res PNG/TIFF for logo work.
- Filenames below are relative to `public/` unless noted.

---

## 1. Brand & system

| Asset | Proposed filename | Spec | Description |
|-------|-------------------|------|-------------|
| **Logo — black** | `brand/logo-black.svg`, `brand/logo-black.png` | SVG + PNG @2x/3x, transparent | Primary mark for light backgrounds (header, cards, admin light chrome). |
| **Logo — white** | `brand/logo-white.svg`, `brand/logo-white.png` | SVG + PNG @2x/3x, transparent | Mark for dark/black sections (footer, trust band, admin dark sidebar). |
| **App icon / favicon** | `brand/favicon.png`, `brand/icon-512.png` | 32×32 + 512×512 PNG | Square TEHA mark or monogram on black or gold — replaces the generated “T” favicon. |
| **Open Graph / social share** | `brand/og-default.jpg` | 1200×630 | Site-wide default share image: brand name + short line (“Work · Travel · Study”) on ash/black with gold rule. |
| **Email header (optional)** | `brand/email-header.png` | 600×120 | Slim logo lockup for Resend templates (black or white depending on template background). |

---

## 2. Homepage

| Asset | Proposed filename | Spec | Description |
|-------|-------------------|------|-------------|
| **Hero primary** | `images/home/hero.jpg` | 1600×1200 (or 2400×1350) | Full-bleed or half-panel hero: applicant or traveller in a real destination. Replaces `HeroVisual` SVG. |
| **Pathway — Work** | `images/home/pathway-work.jpg` | 1200×900 | Workplace or city-of-work context for journey card thumbnail. |
| **Pathway — Study** | `images/home/pathway-study.jpg` | 1200×900 | Campus / library / lecture exterior for journey card thumbnail. |
| **Pathway — Travel** | `images/home/pathway-travel.jpg` | 1200×900 | Landmark or street scene for journey card thumbnail. |
| **Trust / “why us” texture (optional)** | `images/home/trust-texture.jpg` | 2400×1200 soft texture | Subtle ash/architectural texture for the dark trust section background. |
| **Final CTA band (optional)** | `images/home/final-cta.jpg` | 2000×800 | Quiet destination horizon or corridor behind the closing CTA. |

---

## 3. Work abroad

| Asset | Proposed filename | Spec | Description |
|-------|-------------------|------|-------------|
| **Work listing hero** | `images/work/hero.jpg` | 2000×900 | Page hero for `/work-abroad`. |
| **Empty state illustration** | `images/work/empty.jpg` | 800×600 | Branded empty graphic when no jobs are published. |
| **Generic job cover 01** | `images/work/cover-01.jpg` | 1600×900 | Rotating cover until per-job CMS images exist. |
| **Generic job cover 02** | `images/work/cover-02.jpg` | 1600×900 | Same as above. |
| **Generic job cover 03** | `images/work/cover-03.jpg` | 1600×900 | Same as above. |
| **Generic job cover 04** | `images/work/cover-04.jpg` | 1600×900 | Same as above. |
| **Per-job cover (CMS)** | `images/work/jobs/{job-slug}.jpg` | 1600×900 each | One cover per published role when CMS supports uploads (e.g. `images/work/jobs/dubai-hotel-attendant.jpg`). |

---

## 4. Travel packages

| Asset | Proposed filename | Spec | Description |
|-------|-------------------|------|-------------|
| **Travel index hero** | `images/travel/hero.jpg` | 2000×900 | Wide destination photography for `/travel`. |
| **Package cover (per slug)** | `images/travel/packages/{package-slug}.jpg` | 1600×900 each | Card + detail hero; replaces gradient `DestinationPanel` (e.g. `images/travel/packages/dubai-city-escape.jpg`). |
| **Package gallery 01** | `images/travel/packages/{package-slug}-01.jpg` | 1600×1000 | Detail mood shot (landmark / street). |
| **Package gallery 02** | `images/travel/packages/{package-slug}-02.jpg` | 1600×1000 | Detail mood shot (food / culture). |
| **Package gallery 03** | `images/travel/packages/{package-slug}-03.jpg` | 1600×1000 | Detail mood shot (landscape / skyline). |

*Use the package’s URL slug in the filename. Each published package needs at least the cover before launch.*

---

## 5. Study abroad

| Asset | Proposed filename | Spec | Description |
|-------|-------------------|------|-------------|
| **Study index hero** | `images/study/hero.jpg` | 2000×900 | International campus or student city for `/study-abroad`. |
| **Destination cover (per slug)** | `images/study/destinations/{destination-slug}.jpg` | 1600×900 each | Card + detail image (e.g. `images/study/destinations/united-kingdom.jpg`). |
| **Support strip (optional)** | `images/study/support.jpg` | 1600×700 | Document desk / counselling scene with no readable PII. |

---

## 6. About, services, contact

| Asset | Proposed filename | Spec | Description |
|-------|-------------------|------|-------------|
| **About — team or office** | `images/about/team.jpg` | 1600×1000 | Real TEHA team or workspace; builds trust more than stock. |
| **About — process** | `images/about/process.jpg` | 1200×800 | Quiet desk scene: checklist, closed passport, laptop. |
| **Services — Work** | `images/services/work.jpg` | 1000×750 | Tile for job opportunities. |
| **Services — Study** | `images/services/study.jpg` | 1000×750 | Tile for study-abroad assistance. |
| **Services — Travel** | `images/services/travel.jpg` | 1000×750 | Tile for travel services. |
| **Services — Visa** | `images/services/visa.jpg` | 1000×750 | Tile for visa guidance. |
| **Contact — map or place** | `images/contact/place.jpg` | 1200×900 | Neighbourhood or building photo if an address is published. |

---

## 7. Blog & social proof

| Asset | Proposed filename | Spec | Description |
|-------|-------------------|------|-------------|
| **Blog default cover** | `images/blog/default.jpg` | 1600×900 | Fallback when a post has no image. |
| **Blog post cover (per slug)** | `images/blog/posts/{post-slug}.jpg` | 1600×900 each | Topic-relevant cover per article (e.g. `images/blog/posts/how-to-prepare-documents.jpg`). |
| **Author headshot (per person)** | `images/blog/authors/{author-slug}.jpg` | 400×400 | Square headshot for bylines (e.g. `images/blog/authors/ama-mensah.jpg`). |
| **Testimonial portrait (per person)** | `images/testimonials/{person-slug}.jpg` | 320×320 | Only with written consent (e.g. `images/testimonials/kwame-a.jpg`). |

---

## 8. Apply & transactional UI

| Asset | Proposed filename | Spec | Description |
|-------|-------------------|------|-------------|
| **Apply welcome / start** | `images/apply/start.jpg` | 1200×800 | Calm “starting an application” visual. |
| **Success / confirmation** | `images/apply/success.jpg` | 1200×800 | Subtle completion graphic for post-submit. |
| **PDF work-profile header mark** | `brand/pdf-letterhead.png` (+ `.svg`) | 600×200 | High-contrast logo lockup for generated PDF letterhead. |

---

## 9. Admin (light polish)

| Asset | Proposed filename | Spec | Description |
|-------|-------------------|------|-------------|
| **Admin login atmosphere** | `images/admin/login-bg.jpg` | 1920×1080 muted | Full-bleed ash/black texture behind the login card. |
| **Empty — no jobs** | `images/admin/empty-jobs.jpg` | 640×400 | CMS empty state for jobs. |
| **Empty — no travel** | `images/admin/empty-travel.jpg` | 640×400 | CMS empty state for travel packages. |
| **Empty — no posts** | `images/admin/empty-blog.jpg` | 640×400 | CMS empty state for blog posts. |

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
- Alt text: write a short factual description per image when wired into the UI (destination, setting — not SEO keyword stuffing).
