-- CreateEnum
CREATE TYPE "JobGenderEligibility" AS ENUM ('male', 'female', 'both');

-- CreateEnum
CREATE TYPE "ApplicantGender" AS ENUM ('male', 'female');

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN "gender_eligibility" "JobGenderEligibility" NOT NULL DEFAULT 'both';

-- AlterTable
ALTER TABLE "applicant_profiles" ADD COLUMN "gender" "ApplicantGender";
