/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Distributor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Horeka` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Jagal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `PasarHewan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Peternak` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[endCustomerId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `RPH` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Regulator` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'END_CUSTOMER';

-- AlterTable
ALTER TABLE "Distributor" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Horeka" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Jagal" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "jumlahSapi" SET DEFAULT 0,
ALTER COLUMN "jumlahDaging" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "PasarHewan" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "jumlahSapi" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Peternak" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "jumlahSapi" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "endCustomerId" TEXT;

-- AlterTable
ALTER TABLE "RPH" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "jumlahPenyelia" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Regulator" ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "EndCustomer" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "noTelepon" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "EndCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EndCustomer_userId_key" ON "EndCustomer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Distributor_userId_key" ON "Distributor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Horeka_userId_key" ON "Horeka"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Jagal_userId_key" ON "Jagal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasarHewan_userId_key" ON "PasarHewan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Peternak_userId_key" ON "Peternak"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_endCustomerId_key" ON "Profile"("endCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "RPH_userId_key" ON "RPH"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Regulator_userId_key" ON "Regulator"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_endCustomerId_fkey" FOREIGN KEY ("endCustomerId") REFERENCES "EndCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
