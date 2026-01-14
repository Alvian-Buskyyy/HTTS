const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getTransaksiByPenjualType(penjualType) {
  return prisma.transaksiPenjualan.findMany({
    where: { penjualType },
    include: {
      sapi: {
        include: {
          peternak: true,
          pasarHewan: true,
          jagal: true,
        },
      },
      daging: {
        include: {
          sapi: true,
        },
      },
    },
    orderBy: {
      timestamp: "desc",
    },
  });
}

module.exports = getTransaksiByPenjualType;
