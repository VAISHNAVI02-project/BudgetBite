const pool = require('../config/db');
const { generateOrderNumber } = require('../utils/orderUtils');

// Create a new order with complete backend price validation and transaction
const createOrder = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      delivery_instructions,
      payment_method,
      items // Array of { id, type: 'food' | 'combo', quantity }
    } = req.body;

    // Validation
    if (!customer_name || !customer_email || !customer_phone || !delivery_address) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone number, and delivery address are required.'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please select food items to place an order.'
      });
    }

    let calculatedSubtotal = 0;
    const validatedOrderItems = [];

    // Verify every item against database records
    for (const item of items) {
      const quantity = parseInt(item.quantity, 10);
      if (isNaN(quantity) || quantity <= 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Invalid item quantity specified in cart.'
        });
      }

      if (item.type === 'combo') {
        const [comboRows] = await connection.query(
          'SELECT id, name, price, is_active FROM combos WHERE id = ?',
          [item.id]
        );

        if (comboRows.length === 0) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: `Combo with ID ${item.id} is no longer available.`
          });
        }

        const combo = comboRows[0];
        if (!combo.is_active) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: `Combo "${combo.name}" is currently disabled.`
          });
        }

        const unitPrice = parseFloat(combo.price);
        const itemSubtotal = unitPrice * quantity;
        calculatedSubtotal += itemSubtotal;

        validatedOrderItems.push({
          food_id: null,
          combo_id: combo.id,
          item_type: 'combo',
          item_name: combo.name,
          unit_price: unitPrice,
          quantity,
          subtotal: itemSubtotal
        });
      } else {
        // Normal Food Item
        const [foodRows] = await connection.query(
          'SELECT id, name, price, is_available FROM foods WHERE id = ?',
          [item.id]
        );

        if (foodRows.length === 0) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: `Food item with ID ${item.id} not found.`
          });
        }

        const food = foodRows[0];
        if (!food.is_available) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: `Food item "${food.name}" is currently unavailable.`
          });
        }

        const unitPrice = parseFloat(food.price);
        const itemSubtotal = unitPrice * quantity;
        calculatedSubtotal += itemSubtotal;

        validatedOrderItems.push({
          food_id: food.id,
          combo_id: null,
          item_type: 'food',
          item_name: food.name,
          unit_price: unitPrice,
          quantity,
          subtotal: itemSubtotal
        });
      }
    }

    // Configured delivery fee
    const deliveryFee = parseFloat(process.env.DEFAULT_DELIVERY_FEE || '30.00');
    const grandTotal = calculatedSubtotal + deliveryFee;

    // Unique Order Number
    const orderNumber = generateOrderNumber();
    if (!req.user || !req.user.id) {
      await connection.rollback();
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to place your order.'
      });
    }
    const userId = req.user.id;

    // Insert Order record
    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone,
        delivery_address, delivery_instructions, payment_method, payment_status,
        subtotal, delivery_fee, total_amount, order_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        userId,
        customer_name.trim(),
        customer_email.trim().toLowerCase(),
        customer_phone.trim(),
        delivery_address.trim(),
        delivery_instructions ? delivery_instructions.trim() : null,
        payment_method === 'Online Payment' ? 'Online Payment' : 'Cash on Delivery',
        payment_method === 'Online Payment' ? 'Completed' : 'Pending',
        calculatedSubtotal,
        deliveryFee,
        grandTotal,
        'Order Placed'
      ]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const orderItem of validatedOrderItems) {
      await connection.query(
        `INSERT INTO order_items (
          order_id, food_id, combo_id, item_type, item_name, unit_price, quantity, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          orderItem.food_id,
          orderItem.combo_id,
          orderItem.item_type,
          orderItem.item_name,
          orderItem.unit_price,
          orderItem.quantity,
          orderItem.subtotal
        ]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: orderId,
        order_number: orderNumber,
        subtotal: calculatedSubtotal,
        delivery_fee: deliveryFee,
        total_amount: grandTotal,
        order_status: 'Order Placed',
        items_count: validatedOrderItems.length
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Get current customer's order history
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, f.image_url AS food_image, c.image_url AS combo_image
         FROM order_items oi
         LEFT JOIN foods f ON oi.food_id = f.id
         LEFT JOIN combos c ON oi.combo_id = c.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;

      // Check if user has already reviewed this order
      const [review] = await pool.query(
        'SELECT id, rating, comment FROM reviews WHERE order_id = ? AND user_id = ?',
        [order.id, userId]
      );
      order.has_reviewed = review.length > 0;
      order.review = review.length > 0 ? review[0] : null;
    }

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// Get single order for tracking (by ID or Order Number)
const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    let query = 'SELECT * FROM orders WHERE ';
    let params = [];

    if (orderId.startsWith('BB-')) {
      query += 'order_number = ?';
      params.push(orderId);
    } else {
      query += 'id = ?';
      params.push(parseInt(orderId, 10));
    }

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const order = rows[0];

    // Security check: if customer is logged in and not admin, can only see own orders
    if (req.user && req.user.role !== 'admin' && order.user_id && order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order.'
      });
    }

    const [items] = await pool.query(
      `SELECT oi.*, f.image_url AS food_image, c.image_url AS combo_image
       FROM order_items oi
       LEFT JOIN foods f ON oi.food_id = f.id
       LEFT JOIN combos c ON oi.combo_id = c.id
       WHERE oi.order_id = ?`,
      [order.id]
    );

    order.items = items;

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all orders with filter
const getAllOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    let query = `SELECT * FROM orders WHERE 1=1`;
    const params = [];

    if (status && status !== 'all') {
      query += ` AND order_status = ?`;
      params.push(status);
    }

    if (search && search.trim() !== '') {
      query += ` AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)`;
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern);
    }

    query += ` ORDER BY created_at DESC`;

    const [orders] = await pool.query(query, params);

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT * FROM order_items WHERE order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'Order Placed',
      'Preparing Food',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed: ${validStatuses.join(', ')}`
      });
    }

    let query = 'UPDATE orders SET order_status = ? WHERE ';
    let params = [status];

    if (orderId.startsWith('BB-')) {
      query += 'order_number = ?';
      params.push(orderId);
    } else {
      query += 'id = ?';
      params.push(parseInt(orderId, 10));
    }

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    res.json({
      success: true,
      message: `Order status updated to "${status}".`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};
