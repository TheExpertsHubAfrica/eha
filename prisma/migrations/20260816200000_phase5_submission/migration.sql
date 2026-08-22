-- AlterTable
ALTER TABLE "applications" ADD COLUMN "reference_number" TEXT,
ADD COLUMN "submitted_at" TIMESTAMP(3),
ADD COLUMN "declaration_accepted_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "applications_reference_number_key" ON "applications"("reference_number");

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "application_id" TEXT,
    "template" TEXT NOT NULL,
    "to_address" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "provider_id" TEXT,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_reference_sequences" (
    "year" INTEGER NOT NULL,
    "last" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "application_reference_sequences_pkey" PRIMARY KEY ("year")
);

-- CreateIndex
CREATE INDEX "email_logs_application_id_idx" ON "email_logs"("application_id");

-- CreateIndex
CREATE INDEX "email_logs_template_status_idx" ON "email_logs"("template", "status");

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
