/*
  Warnings:

  - The primary key for the `Daging` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Distributor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `EndCustomer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Horeka` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Jagal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PasarHewan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PengecekanHalalSehat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PengecekanSehat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Peternak` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `QR` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RPH` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Sapi` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TransaksiPenjualan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TransaksiPenyembelihan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `User` table. All the data in the column will be lost.
  - The required column `id` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "Daging" DROP CONSTRAINT "Daging_sapiId_fkey";

-- DropForeignKey
ALTER TABLE "EndCustomer" DROP CONSTRAINT "EndCustomer_qRId_fkey";

-- DropForeignKey
ALTER TABLE "PengecekanHalalSehat" DROP CONSTRAINT "PengecekanHalalSehat_sapiId_fkey";

-- DropForeignKey
ALTER TABLE "PengecekanSehat" DROP CONSTRAINT "PengecekanSehat_sapiId_fkey";

-- DropForeignKey
ALTER TABLE "QR" DROP CONSTRAINT "QR_dagingId_fkey";

-- DropForeignKey
ALTER TABLE "QR" DROP CONSTRAINT "QR_sapiId_fkey";

-- DropForeignKey
ALTER TABLE "Sapi" DROP CONSTRAINT "Sapi_jagalId_fkey";

-- DropForeignKey
ALTER TABLE "Sapi" DROP CONSTRAINT "Sapi_pasarHewanId_fkey";

-- DropForeignKey
ALTER TABLE "Sapi" DROP CONSTRAINT "Sapi_peternakId_fkey";

-- DropForeignKey
ALTER TABLE "Sapi" DROP CONSTRAINT "Sapi_rphId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_dagingId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_pembeliId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_penjualId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_sapiId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenyembelihan" DROP CONSTRAINT "TransaksiPenyembelihan_distributorId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenyembelihan" DROP CONSTRAINT "TransaksiPenyembelihan_jagalId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenyembelihan" DROP CONSTRAINT "TransaksiPenyembelihan_rphId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenyembelihan" DROP CONSTRAINT "TransaksiPenyembelihan_sapiId_fkey";

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
ALTER TABLE "User" DROP CONSTRAINT "User_rph_fkey";

-- AlterTable
ALTER TABLE "Daging" DROP CONSTRAINT "Daging_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sapiId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Daging_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Daging_id_seq";

-- AlterTable
ALTER TABLE "Distributor" DROP CONSTRAINT "Distributor_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Distributor_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Distributor_id_seq";

-- AlterTable
ALTER TABLE "EndCustomer" DROP CONSTRAINT "EndCustomer_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "qRId" SET DATA TYPE TEXT,
ADD CONSTRAINT "EndCustomer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "EndCustomer_id_seq";

-- AlterTable
ALTER TABLE "Horeka" DROP CONSTRAINT "Horeka_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Horeka_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Horeka_id_seq";

-- AlterTable
ALTER TABLE "Jagal" DROP CONSTRAINT "Jagal_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Jagal_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Jagal_id_seq";

-- AlterTable
ALTER TABLE "PasarHewan" DROP CONSTRAINT "PasarHewan_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PasarHewan_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PasarHewan_id_seq";

-- AlterTable
ALTER TABLE "PengecekanHalalSehat" DROP CONSTRAINT "PengecekanHalalSehat_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sapiId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PengecekanHalalSehat_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PengecekanHalalSehat_id_seq";

-- AlterTable
ALTER TABLE "PengecekanSehat" DROP CONSTRAINT "PengecekanSehat_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sapiId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PengecekanSehat_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PengecekanSehat_id_seq";

-- AlterTable
ALTER TABLE "Peternak" DROP CONSTRAINT "Peternak_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Peternak_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Peternak_id_seq";

-- AlterTable
ALTER TABLE "QR" DROP CONSTRAINT "QR_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sapiId" SET DATA TYPE TEXT,
ALTER COLUMN "dagingId" SET DATA TYPE TEXT,
ADD CONSTRAINT "QR_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "QR_id_seq";

-- AlterTable
ALTER TABLE "RPH" DROP CONSTRAINT "RPH_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "RPH_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RPH_id_seq";

-- AlterTable
ALTER TABLE "Sapi" DROP CONSTRAINT "Sapi_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "peternakId" SET DATA TYPE TEXT,
ALTER COLUMN "pasarHewanId" SET DATA TYPE TEXT,
ALTER COLUMN "jagalId" SET DATA TYPE TEXT,
ALTER COLUMN "rphId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Sapi_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Sapi_id_seq";

-- AlterTable
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "penjualId" SET DATA TYPE TEXT,
ALTER COLUMN "pembeliId" SET DATA TYPE TEXT,
ALTER COLUMN "sapiId" SET DATA TYPE TEXT,
ALTER COLUMN "dagingId" SET DATA TYPE TEXT,
ALTER COLUMN "pengecekanSehatId" SET DATA TYPE TEXT,
ADD CONSTRAINT "TransaksiPenjualan_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TransaksiPenjualan_id_seq";

-- AlterTable
ALTER TABLE "TransaksiPenyembelihan" DROP CONSTRAINT "TransaksiPenyembelihan_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "rphId" SET DATA TYPE TEXT,
ALTER COLUMN "jagalId" SET DATA TYPE TEXT,
ALTER COLUMN "distributorId" SET DATA TYPE TEXT,
ALTER COLUMN "sapiId" SET DATA TYPE TEXT,
ADD CONSTRAINT "TransaksiPenyembelihan_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TransaksiPenyembelihan_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "peternakId" SET DATA TYPE TEXT,
ALTER COLUMN "pasarHewanId" SET DATA TYPE TEXT,
ALTER COLUMN "jagalId" SET DATA TYPE TEXT,
ALTER COLUMN "rphId" SET DATA TYPE TEXT,
ALTER COLUMN "distributorId" SET DATA TYPE TEXT,
ALTER COLUMN "horekaId" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_peternak_fkey" FOREIGN KEY ("peternakId") REFERENCES "Peternak"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_pasarHewan_fkey" FOREIGN KEY ("pasarHewanId") REFERENCES "PasarHewan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_jagal_fkey" FOREIGN KEY ("jagalId") REFERENCES "Jagal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_rph_fkey" FOREIGN KEY ("rphId") REFERENCES "RPH"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_distributor_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_horeka_fkey" FOREIGN KEY ("horekaId") REFERENCES "Horeka"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EndCustomer" ADD CONSTRAINT "EndCustomer_qRId_fkey" FOREIGN KEY ("qRId") REFERENCES "QR"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sapi" ADD CONSTRAINT "Sapi_peternakId_fkey" FOREIGN KEY ("peternakId") REFERENCES "Peternak"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sapi" ADD CONSTRAINT "Sapi_pasarHewanId_fkey" FOREIGN KEY ("pasarHewanId") REFERENCES "PasarHewan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sapi" ADD CONSTRAINT "Sapi_jagalId_fkey" FOREIGN KEY ("jagalId") REFERENCES "Jagal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sapi" ADD CONSTRAINT "Sapi_rphId_fkey" FOREIGN KEY ("rphId") REFERENCES "RPH"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Daging" ADD CONSTRAINT "Daging_sapiId_fkey" FOREIGN KEY ("sapiId") REFERENCES "Sapi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenyembelihan" ADD CONSTRAINT "TransaksiPenyembelihan_rphId_fkey" FOREIGN KEY ("rphId") REFERENCES "RPH"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenyembelihan" ADD CONSTRAINT "TransaksiPenyembelihan_jagalId_fkey" FOREIGN KEY ("jagalId") REFERENCES "Jagal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenyembelihan" ADD CONSTRAINT "TransaksiPenyembelihan_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenyembelihan" ADD CONSTRAINT "TransaksiPenyembelihan_sapiId_fkey" FOREIGN KEY ("sapiId") REFERENCES "Sapi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenjualan" ADD CONSTRAINT "TransaksiPenjualan_penjualId_fkey" FOREIGN KEY ("penjualId") REFERENCES "Distributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenjualan" ADD CONSTRAINT "TransaksiPenjualan_pembeliId_fkey" FOREIGN KEY ("pembeliId") REFERENCES "Horeka"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenjualan" ADD CONSTRAINT "TransaksiPenjualan_sapiId_fkey" FOREIGN KEY ("sapiId") REFERENCES "Sapi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenjualan" ADD CONSTRAINT "TransaksiPenjualan_dagingId_fkey" FOREIGN KEY ("dagingId") REFERENCES "Daging"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengecekanSehat" ADD CONSTRAINT "PengecekanSehat_sapiId_fkey" FOREIGN KEY ("sapiId") REFERENCES "Sapi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengecekanHalalSehat" ADD CONSTRAINT "PengecekanHalalSehat_sapiId_fkey" FOREIGN KEY ("sapiId") REFERENCES "Sapi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QR" ADD CONSTRAINT "QR_sapiId_fkey" FOREIGN KEY ("sapiId") REFERENCES "Sapi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QR" ADD CONSTRAINT "QR_dagingId_fkey" FOREIGN KEY ("dagingId") REFERENCES "Daging"("id") ON DELETE SET NULL ON UPDATE CASCADE;
