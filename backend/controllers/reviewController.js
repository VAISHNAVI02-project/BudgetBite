const pool = require('../config/db');

// Submit a new review for a delivered order
const createReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { order_id, food_id, rating, comment } = req.body;

    if (!order_id || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, rating (1-5), and written review comment are required.'
      });
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.'
      });
    }

    // Verify order eligibility
    const [orderRows] = await pool.query(
      'SELECT id, user_id, order_status FROM orders WHERE id = ?',
      [order_id]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const order = orderRows[0];
    if (order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own orders.'
      });
    }

    if (order.order_status !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'You can only submit reviews for orders that have been successfully delivered.'
      });
    }

    // Check duplicate review
    const [existing] = await pool.query(
      'SELECT id FROM reviews WHERE user_id = ? AND order_id = ?',
      [userId, order_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a review for this order.'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO reviews (user_id, order_id, food_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [userId, order_id, food_id || null, ratingNum, comment.trim()]
    );

    // If review targeted specific food, update its rating
    if (food_id) {
      const [avgRows] = await pool.query(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE food_id = ?',
        [food_id]
      );
      if (avgRows.length > 0 && avgRows[0].count > 0) {
        await pool.query(
          'UPDATE foods SET rating = ?, rating_count = ? WHERE id = ?',
          [parseFloat(avgRows[0].avg_rating).toFixed(2), avgRows[0].count, food_id]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted.',
      review_id: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

// Get all reviews (for testimonials, admin, or menu)
const getReviews = async (req, res, next) => {
  try {
    const { food_id, limit } = req.query;

    let query = `
      SELECT r.*, u.name AS customer_name, o.order_number, f.name AS food_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN orders o ON r.order_id = o.id
      LEFT JOIN foods f ON r.food_id = f.id
      WHERE 1=1
    `;
    const params = [];

    if (food_id) {
      query += ` AND r.food_id = ?`;
      params.push(food_id);
    }

    query += ` ORDER BY r.created_at DESC`;

    if (limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(limit, 10));
    }

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      count: rows.length,
      reviews: rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getReviews
};
