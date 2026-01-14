const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function enrichTransaksiWithEntityInfo(transaksiList) {
  return Promise.all(
    transaksiList.map(async (transaksi) => {
      let sellerInfo = null;
      let buyerInfo = null;

      // Get seller information
      switch (transaksi.penjualType) {
        case "PETERNAK":
          sellerInfo = await prisma.peternak.findUnique({
            where: { id: transaksi.penjualId },
          });
          break;
        case "PASAR_HEWAN":
          sellerInfo = await prisma.pasarHewan.findUnique({
            where: { id: transaksi.penjualId },
          });
          break;
        case "JAGAL":
          sellerInfo = await prisma.jagal.findUnique({
            where: { id: transaksi.penjualId },
          });
          break;
        case "RPH":
          sellerInfo = await prisma.rPH.findUnique({
            where: { id: transaksi.penjualId },
          });
          break;
        case "DISTRIBUTOR":
          sellerInfo = await prisma.distributor.findUnique({
            where: { id: transaksi.penjualId },
          });
          break;
        case "HOREKA":
          sellerInfo = await prisma.horeka.findUnique({
            where: { id: transaksi.penjualId },
          });
          break;
      }

      // Get buyer information
      switch (transaksi.pembeliType) {
        case "PETERNAK":
          buyerInfo = await prisma.peternak.findUnique({
            where: { id: transaksi.pembeliId },
          });
          break;
        case "PASAR_HEWAN":
          buyerInfo = await prisma.pasarHewan.findUnique({
            where: { id: transaksi.pembeliId },
          });
          break;
        case "JAGAL":
          buyerInfo = await prisma.jagal.findUnique({
            where: { id: transaksi.pembeliId },
          });
          break;
        case "RPH":
          buyerInfo = await prisma.rPH.findUnique({
            where: { id: transaksi.pembeliId },
          });
          break;
        case "DISTRIBUTOR":
          buyerInfo = await prisma.distributor.findUnique({
            where: { id: transaksi.pembeliId },
          });
          break;
        case "HOREKA":
          buyerInfo = await prisma.horeka.findUnique({
            where: { id: transaksi.pembeliId },
          });
          break;
      }

      return {
        ...transaksi,
        sellerInfo,
        buyerInfo,
      };
    })
  );
}

module.exports = enrichTransaksiWithEntityInfo;
