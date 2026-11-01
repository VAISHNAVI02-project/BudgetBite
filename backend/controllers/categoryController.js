const pool = require('../config/db');

// Get all categories with food count
const getCategories = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, COUNT(f.id) AS food_count
      FROM categories c
      LEFT JOIN foods f ON c.id = f.category_id AND f.is_available = 1
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.name ASC
    `);

    res.json({
      success: true,
      categories: rows
    });
  } catch (error) {
    next(error);
  }
};

// Create a new category (Admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image_url, display_order } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.'
      });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, image_url, display_order) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), slug, description || '', image_url || null, display_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category: {
        id: result.insertId,
        name,
        slug,
        description,
        image_url,
        display_order
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory
};
