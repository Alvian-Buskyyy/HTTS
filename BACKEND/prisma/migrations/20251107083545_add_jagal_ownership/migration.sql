-- AlterTable
ALTER TABLE "Sapi" ADD COLUMN     "jagalId" TEXT;

-- AddForeignKey
ALTER TABLE "Sapi" ADD CONSTRAINT "Sapi_jagalId_fkey" FOREIGN KEY ("jagalId") REFERENCES "Jagal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
