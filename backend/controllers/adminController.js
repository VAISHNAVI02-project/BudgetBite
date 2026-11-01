const pool = require('../config/db');

// Admin Dashboard Summary
const getDashboardOverview = async (req, res, next) => {
  try {
    // 1. Overall counts
    const [orderStats] = await pool.query(`
      SELECT
        COUNT(*) AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_revenue
      FROM orders
    `);

    const [customerStats] = await pool.query(`
      SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer'
    `);

    const [foodStats] = await pool.query(`
      SELECT
        COUNT(*) AS total_foods,
        SUM(CASE WHEN is_available = 1 THEN 1 ELSE 0 END) AS available_foods,
        SUM(CASE WHEN is_available = 0 THEN 1 ELSE 0 END) AS unavailable_foods
      FROM foods
    `);

    const [comboStats] = await pool.query(`
      SELECT COUNT(*) AS total_combos FROM combos WHERE is_active = 1
    `);

    // 2. Status Breakdown
    const [statusCounts] = await pool.query(`
      SELECT order_status, COUNT(*) AS count
      FROM orders
      GROUP BY order_status
    `);

    const statuses = {
      'Order Placed': 0,
      'Preparing Food': 0,
      'Out for Delivery': 0,
      'Delivered': 0,
      'Cancelled': 0
    };

    statusCounts.forEach((row) => {
      if (statuses.hasOwnProperty(row.order_status)) {
        statuses[row.order_status] = row.count;
      }
    });

    // 3. Recent 5 orders
    const [recentOrders] = await pool.query(`
      SELECT id, order_number, customer_name, customer_phone, total_amount, order_status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        total_orders: orderStats[0].total_orders || 0,
        total_revenue: parseFloat(orderStats[0].total_revenue) || 0,
        total_customers: customerStats[0].total_customers || 0,
        total_foods: foodStats[0].total_foods || 0,
        available_foods: foodStats[0].available_foods || 0,
        unavailable_foods: foodStats[0].unavailable_foods || 0,
        total_combos: comboStats[0].total_combos || 0,
        orders_by_status: statuses
      },
      recent_orders: recentOrders
    });
  } catch (error) {
    next(error);
  }
};

// Admin Reports Analytics
const getReports = async (req, res, next) => {
  try {
    // 1. Daily sales (last 7 days)
    const [dailySales] = await pool.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m-%d') AS date,
        COUNT(*) AS orders_count,
        SUM(total_amount) AS revenue
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      ORDER BY date ASC
    `);

    // 2. Top popular food items
    const [popularFoods] = await pool.query(`
      SELECT
        oi.item_name,
        SUM(oi.quantity) AS total_sold,
        SUM(oi.subtotal) AS total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.order_status != 'Cancelled'
      GROUP BY oi.item_name
      ORDER BY total_sold DESC
      LIMIT 6
    `);

    // 3. Sales by status
    const [statusDistribution] = await pool.query(`
      SELECT order_status, COUNT(*) AS count, SUM(total_amount) AS revenue
      FROM orders
      GROUP BY order_status
    `);

    // 4. Overall lifetime stats
    const [summary] = await pool.query(`
      SELECT
        COUNT(*) AS total_orders,
        SUM(total_amount) AS total_revenue,
        AVG(total_amount) AS avg_order_value
      FROM orders
      WHERE order_status != 'Cancelled'
    `);

    res.json({
      success: true,
      reports: {
        daily_sales: dailySales,
        popular_foods: popularFoods,
        status_distribution: statusDistribution,
        summary: {
          total_orders: summary[0].total_orders || 0,
          total_revenue: parseFloat(summary[0].total_revenue) || 0,
          avg_order_value: parseFloat(summary[0].avg_order_value || 0).toFixed(2)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
  getReports
};
