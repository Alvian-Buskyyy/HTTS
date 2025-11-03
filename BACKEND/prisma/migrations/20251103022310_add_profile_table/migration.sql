/*
  Warnings:

  - You are about to drop the column `idPengecekanHalalSehat` on the `Daging` table. All the data in the column will be lost.
  - You are about to drop the column `tanggalPenerimaan` on the `Distributor` table. All the data in the column will be lost.
  - You are about to drop the column `tanggalPenerimaan` on the `Horeka` table. All the data in the column will be lost.
  - You are about to drop the column `tanggalPenyembelihan` on the `RPH` table. All the data in the column will be lost.
  - You are about to drop the column `jagalId` on the `Sapi` table. All the data in the column will be lost.
  - You are about to drop the column `rphId` on the `Sapi` table. All the data in the column will be lost.
  - You are about to drop the column `distributorPembeliId` on the `TransaksiPenjualan` table. All the data in the column will be lost.
  - You are about to drop the column `distributorPenjualId` on the `TransaksiPenjualan` table. All the data in the column will be lost.
  - You are about to drop the column `horekaPembeliId` on the `TransaksiPenjualan` table. All the data in the column will be lost.
  - You are about to drop the column `horekaPenjualId` on the `TransaksiPenjualan` table. All the data in the column will be lost.
  - You are about to drop the column `jagalPembeliId` on the `TransaksiPenjualan` table. All the data in the column will be lost.
  - You are about to drop the column `jagalPenjualId` on the `TransaksiPenjualan` table. All the data in the column will be lost.
  - You are about to drop the column `pasarHewanPembeliId` on the `TransaksiPenjualan` table. All the data in the column will be lost.
  - You are about to drop the column `pasarHewanPenjualId` on the `TransaksiPenjualan` table. All the data in the column will be lost.
  - You are about to drop the column `pengecekanSehatId` on the `TransaksiPenjualan` table. All the data in the column will be lost.
  - You are about to drop the column `peternakPembeliId` on the `TransaksiPenjualan` table. All the data in the column will be lost.
  - You are about to drop the column `peternakPenjualId` on the `TransaksiPenjualan` table. All the data in the column will be lost.
  - You are about to drop the column `rphPembeliId` on the `TransaksiPenjualan` table. All the data in the column will be lost.
  - You are about to drop the column `rphPenjualId` on the `TransaksiPenjualan` table. All the data in the column will be lost.
  - You are about to drop the column `distributorId` on the `TransaksiPenyembelihan` table. All the data in the column will be lost.
  - You are about to drop the column `jagalId` on the `TransaksiPenyembelihan` table. All the data in the column will be lost.
  - You are about to drop the column `rphId` on the `TransaksiPenyembelihan` table. All the data in the column will be lost.
  - You are about to drop the column `distributorId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `horekaId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `jagalId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `pasarHewanId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `peternakId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `regulatorId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `rphId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `EndCustomer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `asalId` to the `Sapi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `asalType` to the `Sapi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pembeliId` to the `TransaksiPenjualan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `penjualId` to the `TransaksiPenjualan` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `pembeliType` on the `TransaksiPenjualan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `penjualType` on the `TransaksiPenjualan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `penerimaId` to the `TransaksiPenyembelihan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `penerimaType` to the `TransaksiPenyembelihan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `penyembelihId` to the `TransaksiPenyembelihan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `penyembelihType` to the `TransaksiPenyembelihan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('PETERNAK', 'PASAR_HEWAN', 'JAGAL', 'RPH', 'DISTRIBUTOR', 'HOREKA');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "EndCustomer" DROP CONSTRAINT "EndCustomer_qRId_fkey";

-- DropForeignKey
ALTER TABLE "Sapi" DROP CONSTRAINT "Sapi_jagalId_fkey";

-- DropForeignKey
ALTER TABLE "Sapi" DROP CONSTRAINT "Sapi_rphId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_distributorPembeliId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_distributorPenjualId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_horekaPembeliId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_horekaPenjualId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_jagalPembeliId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_jagalPenjualId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_pasarHewanPembeliId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_pasarHewanPenjualId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_peternakPembeliId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_peternakPenjualId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_rphPembeliId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_rphPenjualId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenyembelihan" DROP CONSTRAINT "TransaksiPenyembelihan_distributorId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenyembelihan" DROP CONSTRAINT "TransaksiPenyembelihan_jagalId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenyembelihan" DROP CONSTRAINT "TransaksiPenyembelihan_rphId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_distributor_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_horeka_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_jagal_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_pasarHewan_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_peternak_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_regulator_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_rph_fkey";

-- DropIndex
DROP INDEX "User_distributorId_key";

-- DropIndex
DROP INDEX "User_horekaId_key";

-- DropIndex
DROP INDEX "User_jagalId_key";

-- DropIndex
DROP INDEX "User_pasarHewanId_key";

-- DropIndex
DROP INDEX "User_peternakId_key";

-- DropIndex
DROP INDEX "User_regulatorId_key";

-- DropIndex
DROP INDEX "User_rphId_key";

-- AlterTable
ALTER TABLE "Daging" DROP COLUMN "idPengecekanHalalSehat";

-- AlterTable
ALTER TABLE "Distributor" DROP COLUMN "tanggalPenerimaan";

-- AlterTable
ALTER TABLE "Horeka" DROP COLUMN "tanggalPenerimaan";

-- AlterTable
ALTER TABLE "RPH" DROP COLUMN "tanggalPenyembelihan";

-- AlterTable
ALTER TABLE "Sapi" DROP COLUMN "jagalId",
DROP COLUMN "rphId",
ADD COLUMN     "asalId" TEXT NOT NULL,
ADD COLUMN     "asalType" "EntityType" NOT NULL,
ADD COLUMN     "beratSapi" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "TransaksiPenjualan" DROP COLUMN "distributorPembeliId",
DROP COLUMN "distributorPenjualId",
DROP COLUMN "horekaPembeliId",
DROP COLUMN "horekaPenjualId",
DROP COLUMN "jagalPembeliId",
DROP COLUMN "jagalPenjualId",
DROP COLUMN "pasarHewanPembeliId",
DROP COLUMN "pasarHewanPenjualId",
DROP COLUMN "pengecekanSehatId",
DROP COLUMN "peternakPembeliId",
DROP COLUMN "peternakPenjualId",
DROP COLUMN "rphPembeliId",
DROP COLUMN "rphPenjualId",
ADD COLUMN     "pembeliId" TEXT NOT NULL,
ADD COLUMN     "penjualId" TEXT NOT NULL,
ALTER COLUMN "timestamp" SET DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "pembeliType",
ADD COLUMN     "pembeliType" "EntityType" NOT NULL,
DROP COLUMN "penjualType",
ADD COLUMN     "penjualType" "EntityType" NOT NULL;

-- AlterTable
ALTER TABLE "TransaksiPenyembelihan" DROP COLUMN "distributorId",
DROP COLUMN "jagalId",
DROP COLUMN "rphId",
ADD COLUMN     "penerimaId" TEXT NOT NULL,
ADD COLUMN     "penerimaType" "EntityType" NOT NULL,
ADD COLUMN     "penyembelihId" TEXT NOT NULL,
ADD COLUMN     "penyembelihType" "EntityType" NOT NULL,
ALTER COLUMN "timestamp" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "distributorId",
DROP COLUMN "horekaId",
DROP COLUMN "jagalId",
DROP COLUMN "pasarHewanId",
DROP COLUMN "peternakId",
DROP COLUMN "regulatorId",
DROP COLUMN "rphId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "EndCustomer";

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "fotoProfil" TEXT,
    "userId" TEXT NOT NULL,
    "peternakId" TEXT,
    "pasarHewanId" TEXT,
    "jagalId" TEXT,
    "rphId" TEXT,
    "distributorId" TEXT,
    "horekaId" TEXT,
    "regulatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_peternakId_key" ON "Profile"("peternakId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_pasarHewanId_key" ON "Profile"("pasarHewanId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_jagalId_key" ON "Profile"("jagalId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_rphId_key" ON "Profile"("rphId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_distributorId_key" ON "Profile"("distributorId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_horekaId_key" ON "Profile"("horekaId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_regulatorId_key" ON "Profile"("regulatorId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_peternakId_fkey" FOREIGN KEY ("peternakId") REFERENCES "Peternak"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_pasarHewanId_fkey" FOREIGN KEY ("pasarHewanId") REFERENCES "PasarHewan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_jagalId_fkey" FOREIGN KEY ("jagalId") REFERENCES "Jagal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_rphId_fkey" FOREIGN KEY ("rphId") REFERENCES "RPH"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_horekaId_fkey" FOREIGN KEY ("horekaId") REFERENCES "Horeka"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_regulatorId_fkey" FOREIGN KEY ("regulatorId") REFERENCES "Regulator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
