const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getAllTransaksiByPembeliType(pembeliType) {
  return prisma.transaksiPenjualan.findMany({
    where: { pembeliType },
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

module.exports = getAllTransaksiByPembeliType;
