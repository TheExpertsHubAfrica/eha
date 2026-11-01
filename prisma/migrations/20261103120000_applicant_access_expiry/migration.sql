-- AlterTable
ALTER TABLE "applications" ADD COLUMN "resume_token_expires_at" TIMESTAMP(3),
ADD COLUMN "access_expires_at" TIMESTAMP(3);

-- Existing submissions get the same access window as new ones; after that applicants request a link.
UPDATE "applications"
SET "access_expires_at" = "submitted_at" + interval '7 days'
WHERE "submitted_at" IS NOT NULL;
