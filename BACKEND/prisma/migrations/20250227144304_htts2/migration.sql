-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PETERNAK', 'PASAR_HEWAN', 'JAGAL', 'RPH', 'DISTRIBUTOR', 'HOREKA');

-- CreateTable
CREATE TABLE "User" (
    "_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "peternakId" INTEGER,
    "pasarHewanId" INTEGER,
    "jagalId" INTEGER,
    "rphId" INTEGER,
    "distributorId" INTEGER,
    "horekaId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_peternakId_key" ON "User"("peternakId");

-- CreateIndex
CREATE UNIQUE INDEX "User_pasarHewanId_key" ON "User"("pasarHewanId");

-- CreateIndex
CREATE UNIQUE INDEX "User_jagalId_key" ON "User"("jagalId");

-- CreateIndex
CREATE UNIQUE INDEX "User_rphId_key" ON "User"("rphId");

-- CreateIndex
CREATE UNIQUE INDEX "User_distributorId_key" ON "User"("distributorId");

-- CreateIndex
CREATE UNIQUE INDEX "User_horekaId_key" ON "User"("horekaId");

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
