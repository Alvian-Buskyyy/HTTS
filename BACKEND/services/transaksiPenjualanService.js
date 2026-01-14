const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Service: Get all transaksi penjualan
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

// Service: Get transaksi by penjual type
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

// Service: Get transaksi by pembeli type
async function getTransaksiByPembeliType(pembeliType) {
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

module.exports = {
  getAllTransaksiPenjualan,
  getTransaksiByPenjualType,
  getTransaksiByPembeliType,
};
