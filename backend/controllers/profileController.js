const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Get profile details with saved addresses
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [userRows] = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    const [addresses] = await pool.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );

    const [orderCount] = await pool.query(
      'SELECT COUNT(*) as total_orders FROM orders WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      user: {
        ...userRows[0],
        total_orders: orderCount[0].total_orders
      },
      addresses
    });
  } catch (error) {
    next(error);
  }
};

// Update profile details
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, phone, current_password, new_password } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required.'
      });
    }

    // If updating password
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password.'
        });
      }

      if (new_password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.'
        });
      }

      const [userRows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
      const isMatch = await bcrypt.compare(current_password, userRows[0].password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect current password.'
        });
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      await pool.query(
        'UPDATE users SET name = ?, phone = ?, password = ? WHERE id = ?',
        [name.trim(), phone.trim(), hashedPassword, userId]
      );
    } else {
      await pool.query(
        'UPDATE users SET name = ?, phone = ? WHERE id = ?',
        [name.trim(), phone.trim(), userId]
      );
    }

    const [updatedUser] = await pool.query(
      'SELECT id, name, email, phone, role FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser[0]
    });
  } catch (error) {
    next(error);
  }
};

// Save a new address
const addAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { address_line, landmark, city, state, postal_code, is_default } = req.body;

    if (!address_line) {
      return res.status(400).json({
        success: false,
        message: 'Address line is required.'
      });
    }

    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }

    const [result] = await pool.query(
      `INSERT INTO addresses (user_id, address_line, landmark, city, state, postal_code, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        address_line.trim(),
        landmark || null,
        city || 'Bengaluru',
        state || 'Karnataka',
        postal_code || '560001',
        is_default ? 1 : 0
      ]
    );

    const [newAddress] = await pool.query('SELECT * FROM addresses WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Address saved successfully.',
      address: newAddress[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete address
const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM addresses WHERE id = ? AND user_id = ?',
      [addressId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found or unauthorized.'
      });
    }

    res.json({
      success: true,
      message: 'Address deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  addAddress,
  deleteAddress
};
