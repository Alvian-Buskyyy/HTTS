const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  const { username, email, password, role, peternakId, pasarHewanId, jagalId, rphId, distributorId, horekaId } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: { username, email, password, role, peternakId, pasarHewanId, jagalId, rphId, distributorId, horekaId },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role, peternakId, pasarHewanId, jagalId, rphId, distributorId, horekaId } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { username, email, password, role, peternakId, pasarHewanId, jagalId, rphId, distributorId, horekaId },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { id: id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update profile photo
exports.updateProfilePhoto = async (req, res) => {
  const { userId } = req.params;
  const { profilePhoto } = req.body;
  
  try {
    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: userId }
    });

    let updatedProfile;
    if (existingProfile) {
      // Update existing profile
      updatedProfile = await prisma.profile.update({
        where: { userId: userId },
        data: { profilePhoto }
      });
    } else {
      // Create new profile if doesn't exist
      updatedProfile = await prisma.profile.create({
        data: {
          userId: userId,
          profilePhoto
        }
      });
    }
    
    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user with profile and entity data
exports.getUserProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      include: {
        profile: true,
        peternak: true,
        jagal: true,
        rph: true,
        pasarHewan: true,
        distributor: true,
        horeka: true,
        endCustomer: true
      }
    });
    
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};