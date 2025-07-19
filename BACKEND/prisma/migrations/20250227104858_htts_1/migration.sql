-- CreateTable
CREATE TABLE "Peternak" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "noTelepon" TEXT NOT NULL,
    "jumlahSapi" INTEGER NOT NULL,
    "sertifikatNKV" TEXT,

    CONSTRAINT "Peternak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasarHewan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "noTelepon" TEXT NOT NULL,
    "jumlahSapi" INTEGER NOT NULL,
    "sertifikatNKV" TEXT,

    CONSTRAINT "PasarHewan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jagal" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "noTelepon" TEXT NOT NULL,
    "jumlahSapi" INTEGER NOT NULL,
    "sertifikatNKV" TEXT,
    "jumlahDaging" INTEGER NOT NULL,

    CONSTRAINT "Jagal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RPH" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "noTelepon" TEXT NOT NULL,
    "sertifikatNKV" TEXT,
    "sertifikatHalal" TEXT,
    "jumlahPenyelia" INTEGER NOT NULL,
    "namaJuleha" TEXT,
    "noSertifJuleha" TEXT,
    "tanggalPenyembelihan" TIMESTAMP(3),

    CONSTRAINT "RPH_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Distributor" (
    "id" SERIAL NOT NULL,
    "namaUsaha" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "noTelepon" TEXT NOT NULL,
    "tanggalPenerimaan" TIMESTAMP(3),
    "kondisiProduk" TEXT,
    "fasilitasPenyimpanan" TEXT,

    CONSTRAINT "Distributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Horeka" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "noTelepon" TEXT NOT NULL,
    "tanggalPenerimaan" TIMESTAMP(3),
    "kondisiProduk" TEXT,

    CONSTRAINT "Horeka_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EndCustomer" (
    "id" SERIAL NOT NULL,
    "qRId" INTEGER,

    CONSTRAINT "EndCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sapi" (
    "id" SERIAL NOT NULL,
    "usia" INTEGER NOT NULL,
    "jenis" TEXT NOT NULL,
    "kelamin" TEXT NOT NULL,
    "peternakId" INTEGER,
    "pasarHewanId" INTEGER,
    "jagalId" INTEGER,
    "rphId" INTEGER,

    CONSTRAINT "Sapi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Daging" (
    "id" SERIAL NOT NULL,
    "sapiId" INTEGER NOT NULL,
    "idPengecekanHalalSehat" INTEGER,
    "berat" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Daging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransaksiPenyembelihan" (
    "id" SERIAL NOT NULL,
    "rphId" INTEGER NOT NULL,
    "jagalId" INTEGER NOT NULL,
    "distributorId" INTEGER,
    "sapiId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "cid" TEXT NOT NULL,

    CONSTRAINT "TransaksiPenyembelihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransaksiPenjualan" (
    "id" SERIAL NOT NULL,
    "penjualId" INTEGER NOT NULL,
    "pembeliId" INTEGER NOT NULL,
    "sapiId" INTEGER,
    "dagingId" INTEGER,
    "jumlahQty" INTEGER NOT NULL,
    "pengecekanSehatId" INTEGER,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "cid" TEXT NOT NULL,

    CONSTRAINT "TransaksiPenjualan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengecekanSehat" (
    "id" SERIAL NOT NULL,
    "sapiId" INTEGER NOT NULL,
    "item" TEXT NOT NULL,
    "boolean" BOOLEAN NOT NULL,
    "cid" TEXT NOT NULL,

    CONSTRAINT "PengecekanSehat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengecekanHalalSehat" (
    "id" SERIAL NOT NULL,
    "sapiId" INTEGER NOT NULL,
    "item" TEXT NOT NULL,
    "boolean" BOOLEAN NOT NULL,
    "cid" TEXT NOT NULL,

    CONSTRAINT "PengecekanHalalSehat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QR" (
    "id" SERIAL NOT NULL,
    "sapiId" INTEGER,
    "dagingId" INTEGER,
    "urlQR" TEXT NOT NULL,

    CONSTRAINT "QR_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Daging_sapiId_key" ON "Daging"("sapiId");

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
