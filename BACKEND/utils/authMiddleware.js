const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Middleware untuk memverifikasi JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

    // Ambil informasi user dari database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        profile: {
          include: {
            jagal: true,
            rph: true,
            regulator: true,
            peternak: true,
            pasarHewan: true,
            distributor: true,
            horeka: true,
            endCustomer: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Middleware untuk memverifikasi role tertentu
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required roles: ${allowedRoles.join(", ")}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

// Middleware khusus untuk Jagal
const requireJagal = requireRole(["JAGAL"]);

// Middleware khusus untuk RPH
const requireRPH = requireRole(["RPH"]);

// Middleware khusus untuk Regulator
const requireRegulator = requireRole(["REGULATOR"]);

// Middleware untuk admin atau role tertentu
const requireAdminOr = (roles) => {
  return requireRole(["ADMIN", ...roles]);
};

module.exports = {
  authenticateToken,
  requireRole,
  requireJagal,
  requireRPH,
  requireRegulator,
  requireAdminOr,
};
