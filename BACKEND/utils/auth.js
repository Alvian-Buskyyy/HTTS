const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const user = require('../models/User');

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Cari user berdasarkan email
        const user = await user.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed. User not found.' });
        }

        // Cek password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Authentication failed. Wrong password.' });
        }

        // Buat token JWT
        const token = jwt.sign({ id: user._id, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });

        // Kirim token ke client
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { login };