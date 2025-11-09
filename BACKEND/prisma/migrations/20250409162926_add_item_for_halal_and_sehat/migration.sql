/*
  Warnings:

  - You are about to drop the column `item` on the `PengecekanHalalSehat` table. All the data in the column will be lost.
  - You are about to drop the column `item` on the `PengecekanSehat` table. All the data in the column will be lost.
  - Added the required column `itemHalalSehatId` to the `PengecekanHalalSehat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemSehatId` to the `PengecekanSehat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PengecekanHalalSehat" DROP COLUMN "item",
ADD COLUMN     "itemHalalSehatId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PengecekanSehat" DROP COLUMN "item",
ADD COLUMN     "itemSehatId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ItemSehat" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "kategori" TEXT,

    CONSTRAINT "ItemSehat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemHalalSehat" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "kategori" TEXT,

    CONSTRAINT "ItemHalalSehat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PengecekanSehat" ADD CONSTRAINT "PengecekanSehat_itemSehatId_fkey" FOREIGN KEY ("itemSehatId") REFERENCES "ItemSehat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengecekanHalalSehat" ADD CONSTRAINT "PengecekanHalalSehat_itemHalalSehatId_fkey" FOREIGN KEY ("itemHalalSehatId") REFERENCES "ItemHalalSehat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
