const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get profile by userId
exports.getProfileByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
      include: {
        user: true,
        peternak: true,
        pasarHewan: true,
        jagal: true,
        rph: true,
        distributor: true,
        horeka: true,
        endCustomer: true,
        regulator: true
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update profile data
exports.updateProfile = async (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { userId: userId },
      data: {
        fotoProfil: updateData.fotoProfil !== undefined ? updateData.fotoProfil : profile.fotoProfil
      }
    });

    // Update entity data based on entityType
    let updatedEntity = null;
    
    if (profile.entityType === 'PETERNAK' && profile.peternakId) {
      updatedEntity = await prisma.peternak.update({
        where: { id: profile.peternakId },
        data: {
          nama: updateData.nama || undefined,
          alamat: updateData.alamat || undefined,
          noTelepon: updateData.noTelepon || undefined,
          sertifikatNKV: updateData.sertifikatNKV || undefined
        }
      });
    } else if (profile.entityType === 'PASAR_HEWAN' && profile.pasarHewanId) {
      updatedEntity = await prisma.pasarHewan.update({
        where: { id: profile.pasarHewanId },
        data: {
          nama: updateData.nama || undefined,
          alamat: updateData.alamat || undefined,
          noTelepon: updateData.noTelepon || undefined
        }
      });
    } else if (profile.entityType === 'JAGAL' && profile.jagalId) {
      updatedEntity = await prisma.jagal.update({
        where: { id: profile.jagalId },
        data: {
          nama: updateData.nama || undefined,
          alamat: updateData.alamat || undefined,
          noTelepon: updateData.noTelepon || undefined,
          sertifikatHalal: updateData.sertifikatHalal || undefined
        }
      });
    } else if (profile.entityType === 'RPH' && profile.rphId) {
      updatedEntity = await prisma.rPH.update({
        where: { id: profile.rphId },
        data: {
          nama: updateData.nama || undefined,
          alamat: updateData.alamat || undefined,
          noTelepon: updateData.noTelepon || undefined,
          sertifikatHalal: updateData.sertifikatHalal || undefined
        }
      });
    } else if (profile.entityType === 'DISTRIBUTOR' && profile.distributorId) {
      updatedEntity = await prisma.distributor.update({
        where: { id: profile.distributorId },
        data: {
          nama: updateData.nama || undefined,
          alamat: updateData.alamat || undefined,
          noTelepon: updateData.noTelepon || undefined
        }
      });
    } else if (profile.entityType === 'HOREKA' && profile.horekaId) {
      updatedEntity = await prisma.horeka.update({
        where: { id: profile.horekaId },
        data: {
          nama: updateData.nama || undefined,
          alamat: updateData.alamat || undefined,
          noTelepon: updateData.noTelepon || undefined,
          jenisBisnis: updateData.jenisBisnis || undefined
        }
      });
    } else if (profile.entityType === 'END_CUSTOMER' && profile.endCustomerId) {
      updatedEntity = await prisma.endCustomer.update({
        where: { id: profile.endCustomerId },
        data: {
          nama: updateData.nama || undefined,
          alamat: updateData.alamat || undefined,
          noTelepon: updateData.noTelepon || undefined
        }
      });
    } else if (profile.entityType === 'REGULATOR' && profile.regulatorId) {
      updatedEntity = await prisma.regulator.update({
        where: { id: profile.regulatorId },
        data: {
          nama: updateData.nama || undefined,
          instansi: updateData.instansi || undefined
        }
      });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
      entity: updatedEntity
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
