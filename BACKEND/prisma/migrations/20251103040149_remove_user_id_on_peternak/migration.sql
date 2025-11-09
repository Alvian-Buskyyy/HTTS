/*
  Warnings:

  - You are about to drop the column `userId` on the `Peternak` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Peternak` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Peternak_userId_key";

-- AlterTable
ALTER TABLE "Peternak" DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "Peternak_id_key" ON "Peternak"("id");
