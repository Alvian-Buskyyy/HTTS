-- AlterTable
ALTER TABLE "TransaksiPenjualan" ADD COLUMN     "verificationCode" TEXT,
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "cid" SET DEFAULT '';
