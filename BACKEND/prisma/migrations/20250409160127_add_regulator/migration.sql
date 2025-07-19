/*
  Warnings:

  - A unique constraint covering the columns `[regulatorId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'REGULATOR';

-- AlterTable
ALTER TABLE "TransaksiPenjualan" ADD COLUMN     "verifikasiPembeli" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifikasiPenjual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifikasiRegulator" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "regulatorId" TEXT;

-- CreateTable
CREATE TABLE "Regulator" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "instansi" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,

    CONSTRAINT "Regulator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_regulatorId_key" ON "User"("regulatorId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_regulator_fkey" FOREIGN KEY ("regulatorId") REFERENCES "Regulator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
