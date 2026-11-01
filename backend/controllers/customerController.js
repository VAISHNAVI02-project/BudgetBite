const pool = require('../config/db');

// Admin: Get all customers with summary statistics
const getCustomers = async (req, res, next) => {
  try {
    const [customers] = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.created_at,
        COUNT(o.id) AS total_orders,
        COALESCE(SUM(o.total_amount), 0) AS total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      count: customers.length,
      customers
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers
};
