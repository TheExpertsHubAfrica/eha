-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('draft', 'submitted', 'under_review', 'documents_required', 'shortlisted', 'processing', 'approved', 'rejected', 'withdrawn', 'completed');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('single', 'married', 'divorced', 'widowed', 'separated');

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'draft',
    "current_step" TEXT NOT NULL DEFAULT 'personal',
    "steps_completed" TEXT[],
    "profile_completed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicant_profiles" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "place_of_birth" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "passport_number" TEXT NOT NULL,
    "previous_nationality" TEXT,
    "marital_status" "MaritalStatus" NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country_of_residence" TEXT NOT NULL,
    "current_city" TEXT NOT NULL,
    "spouse_name" TEXT,
    "spouse_nationality" TEXT,
    "spouse_place_of_birth" TEXT,
    "spouse_date_of_birth" DATE,
    "personal_statement" TEXT,
    "visited_abroad" BOOLEAN NOT NULL DEFAULT false,
    "military_service" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applicant_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_records" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "programme" TEXT,
    "graduation_year" INTEGER,
    "languages" TEXT,
    "certifications" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "education_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment_records" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "employer" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "current" BOOLEAN NOT NULL DEFAULT false,
    "responsibilities" TEXT NOT NULL,
    "reason_for_leaving" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "employment_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_history" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "duration" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "travel_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dependants" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "relationship" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "dependants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'home',
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "military_records" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "rank" TEXT,
    "duration" TEXT NOT NULL,

    CONSTRAINT "military_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_status_history" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "from_status" "ApplicationStatus",
    "to_status" "ApplicationStatus" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "applications_token_hash_key" ON "applications"("token_hash");

-- CreateIndex
CREATE INDEX "applications_job_id_status_idx" ON "applications"("job_id", "status");

-- CreateIndex
CREATE INDEX "applications_expires_at_idx" ON "applications"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "applicant_profiles_application_id_key" ON "applicant_profiles"("application_id");

-- CreateIndex
CREATE INDEX "applicant_profiles_email_idx" ON "applicant_profiles"("email");

-- CreateIndex
CREATE INDEX "applicant_profiles_passport_number_idx" ON "applicant_profiles"("passport_number");

-- CreateIndex
CREATE INDEX "education_records_application_id_idx" ON "education_records"("application_id");

-- CreateIndex
CREATE INDEX "employment_records_application_id_idx" ON "employment_records"("application_id");

-- CreateIndex
CREATE INDEX "travel_history_application_id_idx" ON "travel_history"("application_id");

-- CreateIndex
CREATE INDEX "dependants_application_id_idx" ON "dependants"("application_id");

-- CreateIndex
CREATE INDEX "emergency_contacts_application_id_idx" ON "emergency_contacts"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "military_records_application_id_key" ON "military_records"("application_id");

-- CreateIndex
CREATE INDEX "application_status_history_application_id_idx" ON "application_status_history"("application_id");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_profiles" ADD CONSTRAINT "applicant_profiles_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_records" ADD CONSTRAINT "education_records_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_records" ADD CONSTRAINT "employment_records_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_history" ADD CONSTRAINT "travel_history_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependants" ADD CONSTRAINT "dependants_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "military_records" ADD CONSTRAINT "military_records_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_status_history" ADD CONSTRAINT "application_status_history_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

