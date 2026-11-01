-- AlterTable
ALTER TABLE "applications" ADD COLUMN "resume_token_hash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "applications_resume_token_hash_key" ON "applications"("resume_token_hash");
