const pool = require('../config/db');
const getNextId = require('../config/nextId');

// Get all combos with included food items
const getCombos = async (req, res, next) => {
  try {
    const { all } = req.query;

    let query = 'SELECT * FROM combos';
    if (all !== 'true') {
      query += ' WHERE is_active = 1';
    }
    query += ' ORDER BY price ASC';

    const [combos] = await pool.query(query);

    // Fetch items for each combo
    for (const combo of combos) {
      const [items] = await pool.query(`
        SELECT ci.quantity, f.id AS food_id, f.name, f.price, f.image_url, f.is_veg
        FROM combo_items ci
        JOIN foods f ON ci.food_id = f.id
        WHERE ci.combo_id = ?
      `, [combo.id]);
      combo.items = items;
    }

    res.json({
      success: true,
      count: combos.length,
      combos
    });
  } catch (error) {
    next(error);
  }
};

// Get single combo by ID
const getComboById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [combos] = await pool.query('SELECT * FROM combos WHERE id = ?', [id]);
    if (combos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Combo not found.'
      });
    }

    const combo = combos[0];
    const [items] = await pool.query(`
      SELECT ci.quantity, f.id AS food_id, f.name, f.price, f.image_url, f.is_veg
      FROM combo_items ci
      JOIN foods f ON ci.food_id = f.id
      WHERE ci.combo_id = ?
    `, [combo.id]);

    combo.items = items;

    res.json({
      success: true,
      combo
    });
  } catch (error) {
    next(error);
  }
};

// Create new combo (Admin)
const createCombo = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      name,
      description,
      price,
      original_price,
      image_url,
      is_active,
      items // Array of { food_id, quantity }
    } = req.body;

    if (!name || price === undefined || original_price === undefined) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Name, price, and original_price are required.'
      });
    }

    let finalImageUrl = image_url;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const savings = parseFloat(original_price) - parseFloat(price);

    const comboId = await getNextId(connection, 'combos');
    await connection.query(
      `INSERT INTO combos (id, name, description, price, original_price, savings, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        comboId,
        name.trim(),
        description || '',
        parseFloat(price),
        parseFloat(original_price),
        savings > 0 ? savings : 0,
        finalImageUrl || null,
        is_active !== undefined ? parseInt(is_active, 10) : 1
      ]
    );


    // Insert combo items if provided
    let parsedItems = items;
    if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
      } catch (e) {
        parsedItems = [];
      }
    }

    if (Array.isArray(parsedItems) && parsedItems.length > 0) {
      for (const item of parsedItems) {
        if (item.food_id) {
          const comboItemId = await getNextId(connection, 'combo_items');
          await connection.query(
            'INSERT INTO combo_items (id, combo_id, food_id, quantity) VALUES (?, ?, ?, ?)',
            [comboItemId, comboId, item.food_id, item.quantity || 1]
          );
        }
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Combo created successfully.',
      combo_id: comboId
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Update combo (Admin)
const updateCombo = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      name,
      description,
      price,
      original_price,
      image_url,
      is_active,
      items
    } = req.body;

    const [existing] = await connection.query('SELECT * FROM combos WHERE id = ?', [id]);
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Combo not found.'
      });
    }

    let finalImageUrl = existing[0].image_url;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    } else if (image_url !== undefined) {
      finalImageUrl = image_url;
    }

    const newPrice = price !== undefined ? parseFloat(price) : existing[0].price;
    const newOriginalPrice = original_price !== undefined ? parseFloat(original_price) : existing[0].original_price;
    const savings = newOriginalPrice - newPrice;

    await connection.query(
      `UPDATE combos SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = ?,
        original_price = ?,
        savings = ?,
        image_url = ?,
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        description !== undefined ? description : null,
        newPrice,
        newOriginalPrice,
        savings > 0 ? savings : 0,
        finalImageUrl,
        is_active !== undefined ? parseInt(is_active, 10) : null,
        id
      ]
    );

    // If items provided, re-link
    if (items !== undefined) {
      let parsedItems = items;
      if (typeof items === 'string') {
        try {
          parsedItems = JSON.parse(items);
        } catch (e) {
          parsedItems = [];
        }
      }

      await connection.query('DELETE FROM combo_items WHERE combo_id = ?', [id]);
      if (Array.isArray(parsedItems)) {
        for (const item of parsedItems) {
          if (item.food_id) {
            const comboItemId = await getNextId(connection, 'combo_items');
            await connection.query(
              'INSERT INTO combo_items (id, combo_id, food_id, quantity) VALUES (?, ?, ?, ?)',
              [comboItemId, id, item.food_id, item.quantity || 1]
            );
          }
        }
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Combo updated successfully.'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Delete combo (Admin)
const deleteCombo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM combos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Combo not found.'
      });
    }

    res.json({
      success: true,
      message: 'Combo deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCombos,
  getComboById,
  createCombo,
  updateCombo,
  deleteCombo
};
