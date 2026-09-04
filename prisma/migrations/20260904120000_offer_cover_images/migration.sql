-- AlterTable
ALTER TABLE "jobs" ADD COLUMN "cover_image_key" TEXT,
ADD COLUMN "cover_image_mime" TEXT;

-- AlterTable
ALTER TABLE "travel_packages" ADD COLUMN "cover_image_key" TEXT,
ADD COLUMN "cover_image_mime" TEXT;
