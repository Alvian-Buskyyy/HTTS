const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getAllTransaksiPenjualan() {
  return prisma.transaksiPenjualan.findMany({
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

module.exports = getAllTransaksiPenjualan;
