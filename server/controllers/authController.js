const User    = require('../models/User');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '24h' });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, age, gender, height, weight, activityLevel } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'Name, email and password are required' });
    if (password.length < 8) return res.status(400).json({ msg: 'Password must be at least 8 characters' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, age, gender, height, weight, activityLevel });

    res.status(201).json({ token: signToken(user._id), user: { _id: user._id, name, email, age, gender, height, weight, activityLevel } });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: 'Invalid credentials' });

    const { password: _, ...userData } = user.toObject();
    res.json({ token: signToken(user._id), user: userData });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json(req.user);
};

// PUT /api/auth/update
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'age', 'gender', 'height', 'weight', 'activityLevel', 'profileImage'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE /api/auth/delete
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ msg: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
