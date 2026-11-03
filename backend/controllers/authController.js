const pool = require('../config/db');
const getNextId = require('../config/nextId');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'budgetbite_super_secret_jwt_key_2026_secured',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Customer Registration
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, phone.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please login instead.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nextId = await getNextId(pool, 'users');

const [result] = await pool.query(
  'INSERT INTO users (id, name, email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
  [nextId, name.trim(), normalizedEmail, hashedPassword, phone.trim(), 'customer']
);

    const newUser = {
      id: nextId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      role: 'customer'
    };

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: newUser
    });
  } catch (error) {
    next(error);
  }
};

// User Login (Customer or Admin)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [rows] = await pool.query(
      'SELECT id, name, email, password, phone, role FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    const token = generateToken(userPayload);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: userPayload
    });
  } catch (error) {
    next(error);
  }
};

// Get authenticated user details
const getMe = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    res.json({
      success: true,
      user: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
