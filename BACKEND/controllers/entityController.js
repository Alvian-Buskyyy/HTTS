const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all registered entities untuk landing page "Teman Halal"
exports.getAllRegisteredEntities = async (req, res) => {
  try {
    const [peternaks, pasarHewans, jagals, rphs, distributors, horekas] = await Promise.all([
      prisma.peternak.findMany({
        select: {
          id: true,
          nama: true,
          alamat: true,
          noTelepon: true,
          jumlahSapi: true,
          sertifikatNKV: true,
          profiles: {
            select: {
              fotoProfil: true
            }
          }
        }
      }),
      prisma.pasarHewan.findMany({
        select: {
          id: true,
          nama: true,
          alamat: true,
          noTelepon: true,
          jumlahSapi: true,
          sertifikatNKV: true,
          profiles: {
            select: {
              fotoProfil: true
            }
          }
        }
      }),
      prisma.jagal.findMany({
        select: {
          id: true,
          nama: true,
          alamat: true,
          noTelepon: true,
          jumlahSapi: true,
          jumlahDaging: true,
          sertifikatNKV: true,
          profiles: {
            select: {
              fotoProfil: true
            }
          }
        }
      }),
      prisma.rPH.findMany({
        select: {
          id: true,
          nama: true,
          alamat: true,
          noTelepon: true,
          sertifikatNKV: true,
          sertifikatHalal: true,
          namaJuleha: true,
          noSertifJuleha: true,
          jumlahPenyelia: true,
          profiles: {
            select: {
              fotoProfil: true
            }
          }
        }
      }),
      prisma.distributor.findMany({
        select: {
          id: true,
          namaUsaha: true,
          alamat: true,
          noTelepon: true,
          kondisiProduk: true,
          fasilitasPenyimpanan: true,
          profiles: {
            select: {
              fotoProfil: true
            }
          }
        }
      }),
      prisma.horeka.findMany({
        select: {
          id: true,
          nama: true,
          alamat: true,
          noTelepon: true,
          kondisiProduk: true,
          profiles: {
            select: {
              fotoProfil: true
            }
          }
        }
      }),
    ]);

    // Transform data to unified format for landing page
    const transformedEntities = [];

    // Add Peternak
    peternaks.forEach(p => {
      transformedEntities.push({
        id: p.id,
        name: p.nama,
        type: 'farmer',
        location: p.alamat || 'Lokasi tidak tersedia',
        description: `Peternakan dengan ${p.jumlahSapi || 0} ekor sapi. ${p.sertifikatNKV ? 'Tersertifikasi NKV.' : 'Sedang dalam proses sertifikasi.'}`,
        icon: 'fas fa-tractor',
        color: 'primary',
        since: '2024',
        certification: p.sertifikatNKV ? 'Tersertifikasi NKV' : 'Dalam Proses',
        profilePhoto: p.profiles?.[0]?.fotoProfil || null
      });
    });

    // Add Pasar Hewan
    pasarHewans.forEach(ph => {
      transformedEntities.push({
        id: ph.id,
        name: ph.nama,
        type: 'animal-market',
        location: ph.alamat || 'Lokasi tidak tersedia',
        description: `Pasar hewan dengan ${ph.jumlahSapi || 0} ekor sapi. Perdagangan ternak berkualitas dan ditangani dengan baik.`,
        icon: 'fas fa-cow',
        color: 'yellow-500',
        since: '2024',
        certification: ph.sertifikatNKV ? 'Tersertifikasi NKV' : 'Dalam Proses',
        profilePhoto: ph.profiles?.[0]?.fotoProfil || null
      });
    });

    // Add Jagal
    jagals.forEach(j => {
      transformedEntities.push({
        id: j.id,
        name: j.nama,
        type: 'jagal',
        location: j.alamat || 'Lokasi tidak tersedia',
        description: `Jagal profesional dengan ${j.jumlahSapi || 0} ekor sapi dan ${j.jumlahDaging || 0} daging. ${j.sertifikatNKV ? 'Tersertifikasi NKV.' : 'Sedang dalam proses sertifikasi.'}`,
        icon: 'fas fa-kaaba',
        color: 'green-500',
        since: '2024',
        certification: j.sertifikatNKV ? 'Tersertifikasi NKV' : 'Dalam Proses',
        profilePhoto: j.profiles?.[0]?.fotoProfil || null
      });
    });

    // Add RPH
    rphs.forEach(r => {
      transformedEntities.push({
        id: r.id,
        name: r.nama,
        type: 'slaughterhouse',
        location: r.alamat || 'Lokasi tidak tersedia',
        description: `Rumah potong hewan dengan ${r.jumlahPenyelia || 0} penyelia. ${r.namaJuleha ? `Juleha: ${r.namaJuleha}` : ''} ${r.sertifikatHalal ? 'Tersertifikasi Halal.' : 'Standar halal yang tinggi.'}`,
        icon: 'fas fa-industry',
        color: 'red-500',
        since: '2024',
        certification: r.sertifikatHalal ? 'Tersertifikasi Halal' : 'Dalam Proses',
        profilePhoto: r.profiles?.[0]?.fotoProfil || null
      });
    });

    // Add Distributor
    distributors.forEach(d => {
      transformedEntities.push({
        id: d.id,
        name: d.namaUsaha,
        type: 'distributor',
        location: d.alamat || 'Lokasi tidak tersedia',
        description: `Distributor daging halal dengan ${d.fasilitasPenyimpanan || 'fasilitas penyimpanan modern'}. ${d.kondisiProduk ? `Kondisi produk: ${d.kondisiProduk}` : 'Sistem cold chain dan jaringan distribusi luas.'}`,
        icon: 'fas fa-truck-loading',
        color: 'indigo-500',
        since: '2024',
        certification: d.fasilitasPenyimpanan ? 'Tersertifikasi Distribusi' : 'Dalam Proses',
        profilePhoto: d.profiles?.[0]?.fotoProfil || null
      });
    });

    // Add HoReCa
    horekas.forEach(h => {
      transformedEntities.push({
        id: h.id,
        name: h.nama,
        type: 'horeca',
        location: h.alamat || 'Lokasi tidak tersedia',
        description: `Hotel, Restoran, atau Katering yang berkomitmen menyajikan produk halal berkualitas. ${h.kondisiProduk ? `Kondisi produk: ${h.kondisiProduk}` : ''}`,
        icon: 'fas fa-utensils',
        color: 'green-500',
        since: '2024',
        certification: h.kondisiProduk ? 'Tersertifikasi Halal' : 'Dalam Proses',
        profilePhoto: h.profiles?.[0]?.fotoProfil || null
      });
    });

    res.status(200).json({
      success: true,
      message: 'Daftar entitas terdaftar berhasil diambil',
      data: transformedEntities,
      count: {
        peternak: peternaks.length,
        pasarHewan: pasarHewans.length,
        jagal: jagals.length,
        rph: rphs.length,
        distributor: distributors.length,
        horeka: horekas.length,
        total: transformedEntities.length,
      }
    });
  } catch (error) {
    console.error('Error fetching entities:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get entity by type and ID
exports.getEntityById = async (req, res) => {
  const { entityType, entityId } = req.params;
  
  try {
    let entity = null;
    
    switch (entityType.toUpperCase()) {
      case 'PETERNAK':
        entity = await prisma.peternak.findUnique({ 
          where: { id: entityId },
          include: {
            sapi: true,
            profiles: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                  }
                }
              }
            }
          }
        });
        break;
      case 'PASAR_HEWAN':
        entity = await prisma.pasarHewan.findUnique({ 
          where: { id: entityId },
          include: {
            sapi: true,
            profiles: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                  }
                }
              }
            }
          }
        });
        break;
      case 'JAGAL':
        entity = await prisma.jagal.findUnique({ 
          where: { id: entityId },
          include: {
            profiles: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                  }
                }
              }
            }
          }
        });
        break;
      case 'RPH':
        entity = await prisma.rPH.findUnique({ 
          where: { id: entityId },
          include: {
            profiles: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                  }
                }
              }
            }
          }
        });
        break;
      case 'DISTRIBUTOR':
        entity = await prisma.distributor.findUnique({ 
          where: { id: entityId },
          include: {
            profiles: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                  }
                }
              }
            }
          }
        });
        break;
      case 'HOREKA':
        entity = await prisma.horeka.findUnique({ 
          where: { id: entityId },
          include: {
            profiles: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                  }
                }
              }
            }
          }
        });
        break;
      default:
        return res.status(400).json({ error: 'Tipe entitas tidak valid' });
    }
    
    if (!entity) {
      return res.status(404).json({ error: `${entityType} dengan ID ${entityId} tidak ditemukan` });
    }
    
    res.status(200).json({
      type: entityType.toUpperCase(),
      data: entity,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validate if entity exists (helper endpoint for validations)
exports.validateEntity = async (req, res) => {
  const { entityType, entityId } = req.body;
  
  try {
    let exists = false;
    
    switch (entityType.toUpperCase()) {
      case 'PETERNAK':
        exists = !!(await prisma.peternak.findUnique({ where: { id: entityId } }));
        break;
      case 'PASAR_HEWAN':
        exists = !!(await prisma.pasarHewan.findUnique({ where: { id: entityId } }));
        break;
      case 'JAGAL':
        exists = !!(await prisma.jagal.findUnique({ where: { id: entityId } }));
        break;
      case 'RPH':
        exists = !!(await prisma.rPH.findUnique({ where: { id: entityId } }));
        break;
      case 'DISTRIBUTOR':
        exists = !!(await prisma.distributor.findUnique({ where: { id: entityId } }));
        break;
      case 'HOREKA':
        exists = !!(await prisma.horeka.findUnique({ where: { id: entityId } }));
        break;
      default:
        return res.status(400).json({ error: 'Tipe entitas tidak valid' });
    }
    
    res.status(200).json({
      entityType,
      entityId,
      exists,
      message: exists ? 'Entitas ditemukan dalam sistem' : 'Entitas tidak ditemukan dalam sistem'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
