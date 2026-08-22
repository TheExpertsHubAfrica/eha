-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "JobAvailability" AS ENUM ('open', 'limited', 'closed');

-- CreateEnum
CREATE TYPE "TravelAccent" AS ENUM ('navy', 'blue', 'teal', 'sand', 'rose');

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "city_slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "salary_amount" DECIMAL(12,2) NOT NULL,
    "salary_currency" TEXT NOT NULL,
    "converted_amount" DECIMAL(12,2),
    "converted_currency" TEXT,
    "conversion_note" TEXT,
    "conversion_source" TEXT,
    "conversion_at" TIMESTAMP(3),
    "benefits" TEXT[],
    "includes_accommodation" BOOLEAN NOT NULL DEFAULT false,
    "includes_flight" BOOLEAN NOT NULL DEFAULT false,
    "includes_visa_support" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "availability" "JobAvailability" NOT NULL DEFAULT 'open',
    "overview" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT[],
    "requirements" TEXT[],
    "accommodation" TEXT NOT NULL,
    "flight" TEXT NOT NULL,
    "visa" TEXT NOT NULL,
    "working_conditions" TEXT NOT NULL,
    "application_requirements" TEXT[],
    "important_information" TEXT[],
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_faqs" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "job_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_document_requirements" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "accepted_types" TEXT[],
    "max_size_mb" INTEGER NOT NULL DEFAULT 5,
    "instructions" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "job_document_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_profile_section_requirements" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "job_profile_section_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_packages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "includes" TEXT[],
    "excludes" TEXT[],
    "accent" "TravelAccent" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_opportunities" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "support" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jobs_status_featured_idx" ON "jobs"("status", "featured");

-- CreateIndex
CREATE INDEX "jobs_status_published_at_idx" ON "jobs"("status", "published_at");

-- CreateIndex
CREATE INDEX "jobs_country_code_idx" ON "jobs"("country_code");

-- CreateIndex
CREATE INDEX "jobs_category_idx" ON "jobs"("category");

-- CreateIndex
CREATE INDEX "jobs_availability_idx" ON "jobs"("availability");

-- CreateIndex
CREATE INDEX "jobs_salary_amount_idx" ON "jobs"("salary_amount");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_city_slug_slug_key" ON "jobs"("city_slug", "slug");

-- CreateIndex
CREATE INDEX "job_faqs_job_id_idx" ON "job_faqs"("job_id");

-- CreateIndex
CREATE INDEX "job_document_requirements_job_id_idx" ON "job_document_requirements"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_document_requirements_job_id_key_key" ON "job_document_requirements"("job_id", "key");

-- CreateIndex
CREATE INDEX "job_profile_section_requirements_job_id_idx" ON "job_profile_section_requirements"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_profile_section_requirements_job_id_section_key" ON "job_profile_section_requirements"("job_id", "section");

-- CreateIndex
CREATE UNIQUE INDEX "travel_packages_slug_key" ON "travel_packages"("slug");

-- CreateIndex
CREATE INDEX "travel_packages_status_featured_idx" ON "travel_packages"("status", "featured");

-- CreateIndex
CREATE UNIQUE INDEX "study_opportunities_slug_key" ON "study_opportunities"("slug");

-- CreateIndex
CREATE INDEX "study_opportunities_status_featured_idx" ON "study_opportunities"("status", "featured");

-- AddForeignKey
ALTER TABLE "job_faqs" ADD CONSTRAINT "job_faqs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_document_requirements" ADD CONSTRAINT "job_document_requirements_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_profile_section_requirements" ADD CONSTRAINT "job_profile_section_requirements_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

