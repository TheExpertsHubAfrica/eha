# The Experts Hub Africa

Production-bound platform for overseas work, travel, and study applications.

## Current: Phase 7

Analytics (funnel, job performance, 30-day submissions) plus CMS for blog, FAQs, testimonials, legal pages, contact details, and email template copy.

CSV exports omit passport files. Page-view events do not store names or documents.

Staff user-management UI is not in this phase.

### First admin account

1. Set `AUTH_SECRET` (16+ characters) in `.env.local`.
2. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (8+ characters).
3. Run `npm run db:seed` — it upserts that email as `super_admin`.
4. Sign in at `/admin/login`.

## Local setup

```bash
cp .env.example .env.local
# Set DATABASE_URL to your Neon connection string (uncommented, with ?sslmode=require)
npm install
npx prisma generate
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Contact, WhatsApp, and social fields stay hidden until they are set in `.env.local` or Admin → Settings.

Uploads use gitignored local disk (`storage/uploads`) unless `S3_BUCKET` and keys are set. Confirmation email sends only when `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set; admin notification also needs `ADMIN_NOTIFICATION_EMAIL`.

## Scripts

- `npm run dev` — development server
- `npm run db:push` — apply Prisma schema to Neon
- `npm run db:seed` — seed Dubai jobs, travel, study destinations, and the first admin when `ADMIN_EMAIL` / `ADMIN_PASSWORD` are set
- `npm run db:migrate` — apply committed migrations (`prisma migrate deploy`)
- `npm run test:uploads` — invalid and valid file-type checks
- `npm run test:apply` — application reference format checks
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript
- `npm run build` — production build
