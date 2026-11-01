const pool = require('../config/db');

// Get all foods with flexible filters & search
const getFoods = async (req, res, next) => {
  try {
    const {
      category,
      search,
      is_veg,
      min_price,
      max_price,
      sort,
      tag,
      all // if true and admin, show unavailable as well
    } = req.query;

    let query = `
      SELECT f.*, c.name AS category_name, c.slug AS category_slug
      FROM foods f
      JOIN categories c ON f.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by availability unless requested all
    if (all !== 'true') {
      query += ` AND f.is_available = 1`;
    }

    // Filter by category slug or ID
    if (category && category !== 'all') {
      if (isNaN(category)) {
        query += ` AND c.slug = ?`;
        params.push(category);
      } else {
        query += ` AND f.category_id = ?`;
        params.push(parseInt(category, 10));
      }
    }

    // Filter by search query (name or description)
    if (search && search.trim() !== '') {
      query += ` AND (f.name LIKE ? OR f.description LIKE ?)`;
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern);
    }

    // Filter by vegetarian/non-vegetarian
    if (is_veg !== undefined && is_veg !== '') {
      query += ` AND f.is_veg = ?`;
      params.push(parseInt(is_veg, 10));
    }

    // Filter by price range
    if (min_price) {
      query += ` AND f.price >= ?`;
      params.push(parseFloat(min_price));
    }
    if (max_price) {
      query += ` AND f.price <= ?`;
      params.push(parseFloat(max_price));
    }

    // Filter by Crave tag (spicy, cheesy, crunchy, light, filling, sweet)
    if (tag) {
      query += ` AND FIND_IN_SET(?, REPLACE(f.tags, ' ', '')) > 0`;
      params.push(tag.toLowerCase().trim());
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ` ORDER BY f.price ASC`;
        break;
      case 'price_desc':
        query += ` ORDER BY f.price DESC`;
        break;
      case 'rating':
        query += ` ORDER BY f.rating DESC, f.rating_count DESC`;
        break;
      case 'newest':
        query += ` ORDER BY f.created_at DESC`;
        break;
      default:
        query += ` ORDER BY c.display_order ASC, f.name ASC`;
    }

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      count: rows.length,
      foods: rows
    });
  } catch (error) {
    next(error);
  }
};

// Get single food by ID
const getFoodById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT f.*, c.name AS category_name, c.slug AS category_slug
      FROM foods f
      JOIN categories c ON f.category_id = c.id
      WHERE f.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found.'
      });
    }

    res.json({
      success: true,
      food: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Create new food item (Admin)
const createFood = async (req, res, next) => {
  try {
    const {
      category_id,
      name,
      description,
      price,
      is_veg,
      is_available,
      image_url,
      tags
    } = req.body;

    if (!category_id || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Category, name, and price are required fields.'
      });
    }

    let finalImageUrl = image_url;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const [result] = await pool.query(
      `INSERT INTO foods (category_id, name, description, price, is_veg, is_available, image_url, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parseInt(category_id, 10),
        name.trim(),
        description || '',
        parseFloat(price),
        is_veg !== undefined ? parseInt(is_veg, 10) : 1,
        is_available !== undefined ? parseInt(is_available, 10) : 1,
        finalImageUrl || null,
        tags || ''
      ]
    );

    const [newFood] = await pool.query(`
      SELECT f.*, c.name AS category_name
      FROM foods f
      JOIN categories c ON f.category_id = c.id
      WHERE f.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Food item created successfully.',
      food: newFood[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update food item (Admin)
const updateFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      description,
      price,
      is_veg,
      is_available,
      image_url,
      tags
    } = req.body;

    // Check food exists
    const [existing] = await pool.query('SELECT * FROM foods WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found.'
      });
    }

    let finalImageUrl = existing[0].image_url;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    } else if (image_url !== undefined) {
      finalImageUrl = image_url;
    }

    await pool.query(
      `UPDATE foods SET
        category_id = COALESCE(?, category_id),
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        is_veg = COALESCE(?, is_veg),
        is_available = COALESCE(?, is_available),
        image_url = ?,
        tags = COALESCE(?, tags)
       WHERE id = ?`,
      [
        category_id ? parseInt(category_id, 10) : null,
        name ? name.trim() : null,
        description !== undefined ? description : null,
        price !== undefined ? parseFloat(price) : null,
        is_veg !== undefined ? parseInt(is_veg, 10) : null,
        is_available !== undefined ? parseInt(is_available, 10) : null,
        finalImageUrl,
        tags !== undefined ? tags : null,
        id
      ]
    );

    const [updated] = await pool.query(`
      SELECT f.*, c.name AS category_name
      FROM foods f
      JOIN categories c ON f.category_id = c.id
      WHERE f.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Food item updated successfully.',
      food: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete food item (Admin)
const deleteFood = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM foods WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found.'
      });
    }

    res.json({
      success: true,
      message: 'Food item deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood
};
