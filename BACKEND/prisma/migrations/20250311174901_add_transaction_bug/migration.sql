/*
  Warnings:

  - You are about to drop the column `pembeliId` on the `TransaksiPenjualan` table. All the data in the column will be lost.
  - You are about to drop the column `penjualId` on the `TransaksiPenjualan` table. All the data in the column will be lost.
  - Added the required column `pembeliType` to the `TransaksiPenjualan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `penjualType` to the `TransaksiPenjualan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_pembeliId_fkey";

-- DropForeignKey
ALTER TABLE "TransaksiPenjualan" DROP CONSTRAINT "TransaksiPenjualan_penjualId_fkey";

-- AlterTable
ALTER TABLE "TransaksiPenjualan" DROP COLUMN "pembeliId",
DROP COLUMN "penjualId",
ADD COLUMN     "distributorPembeliId" TEXT,
ADD COLUMN     "distributorPenjualId" TEXT,
ADD COLUMN     "horekaPembeliId" TEXT,
ADD COLUMN     "horekaPenjualId" TEXT,
ADD COLUMN     "jagalPembeliId" TEXT,
ADD COLUMN     "jagalPenjualId" TEXT,
ADD COLUMN     "pasarHewanPembeliId" TEXT,
ADD COLUMN     "pasarHewanPenjualId" TEXT,
ADD COLUMN     "pembeliType" TEXT NOT NULL,
ADD COLUMN     "penjualType" TEXT NOT NULL,
ADD COLUMN     "peternakPembeliId" TEXT,
ADD COLUMN     "peternakPenjualId" TEXT,
ADD COLUMN     "rphPembeliId" TEXT,
ADD COLUMN     "rphPenjualId" TEXT;

-- AddForeignKey
ALTER TABLE "TransaksiPenjualan" ADD CONSTRAINT "TransaksiPenjualan_peternakPenjualId_fkey" FOREIGN KEY ("peternakPenjualId") REFERENCES "Peternak"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenjualan" ADD CONSTRAINT "TransaksiPenjualan_pasarHewanPenjualId_fkey" FOREIGN KEY ("pasarHewanPenjualId") REFERENCES "PasarHewan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenjualan" ADD CONSTRAINT "TransaksiPenjualan_jagalPenjualId_fkey" FOREIGN KEY ("jagalPenjualId") REFERENCES "Jagal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenjualan" ADD CONSTRAINT "TransaksiPenjualan_rphPenjualId_fkey" FOREIGN KEY ("rphPenjualId") REFERENCES "RPH"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenjualan" ADD CONSTRAINT "TransaksiPenjualan_distributorPenjualId_fkey" FOREIGN KEY ("distributorPenjualId") REFERENCES "Distributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenjualan" ADD CONSTRAINT "TransaksiPenjualan_horekaPenjualId_fkey" FOREIGN KEY ("horekaPenjualId") REFERENCES "Horeka"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenjualan" ADD CONSTRAINT "TransaksiPenjualan_peternakPembeliId_fkey" FOREIGN KEY ("peternakPembeliId") REFERENCES "Peternak"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenjualan" ADD CONSTRAINT "TransaksiPenjualan_pasarHewanPembeliId_fkey" FOREIGN KEY ("pasarHewanPembeliId") REFERENCES "PasarHewan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenjualan" ADD CONSTRAINT "TransaksiPenjualan_jagalPembeliId_fkey" FOREIGN KEY ("jagalPembeliId") REFERENCES "Jagal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenjualan" ADD CONSTRAINT "TransaksiPenjualan_rphPembeliId_fkey" FOREIGN KEY ("rphPembeliId") REFERENCES "RPH"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenjualan" ADD CONSTRAINT "TransaksiPenjualan_distributorPembeliId_fkey" FOREIGN KEY ("distributorPembeliId") REFERENCES "Distributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenjualan" ADD CONSTRAINT "TransaksiPenjualan_horekaPembeliId_fkey" FOREIGN KEY ("horekaPembeliId") REFERENCES "Horeka"("id") ON DELETE SET NULL ON UPDATE CASCADE;
