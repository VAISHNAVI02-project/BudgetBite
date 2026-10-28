require("dotenv").config();
require("./db");

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("BudgetBite backend is working!");
});

app.get("/api/foods", (req, res) => {
  db.query("SELECT * FROM food_items", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

app.post("/api/orders", (req, res) => {
  const { customer_name, phone, address, items } = req.body;

  // Validate customer details and cart
  if (
    !customer_name?.trim() ||
    !/^\d{10}$/.test(phone || "") ||
    !address?.trim() ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      error: "Please provide valid customer details and cart items.",
    });
  }

  const validItems = items.every(
    (item) =>
      Number.isInteger(Number(item.id)) &&
      Number.isInteger(Number(item.quantity)) &&
      Number(item.quantity) > 0
  );

  if (!validItems) {
    return res.status(400).json({
      error: "Invalid food items or quantities.",
    });
  }

  const foodIds = [...new Set(items.map((item) => Number(item.id)))];

  // Get actual prices from MySQL
  db.query(
    "SELECT id, price FROM food_items WHERE id IN (?)",
    [foodIds],
    (err, foods) => {
      if (err) {
        return res.status(500).json({ error: "Unable to verify food items." });
      }

      if (foods.length !== foodIds.length) {
        return res.status(400).json({ error: "Some food items were not found." });
      }

      const foodMap = new Map(
        foods.map((food) => [Number(food.id), Number(food.price)])
      );

      const orderItems = items.map((item) => ({
        food_id: Number(item.id),
        quantity: Number(item.quantity),
        price: foodMap.get(Number(item.id)),
      }));

      const total = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      db.beginTransaction((err) => {
        if (err) {
          return res.status(500).json({ error: "Could not start order." });
        }

        db.query(
          `INSERT INTO orders
           (customer_name, phone, address, total_amount, status)
           VALUES (?, ?, ?, ?, ?)`,
          [
            customer_name.trim(),
            phone,
            address.trim(),
            total,
            "Order Placed",
          ],
          (err, result) => {
            if (err) {
              return db.rollback(() =>
                res.status(500).json({ error: "Could not save the order." })
              );
            }

            const orderId = result.insertId;

            const orderItemRows = orderItems.map((item) => [
              orderId,
              item.food_id,
              item.quantity,
              item.price,
            ]);

            db.query(
              `INSERT INTO order_items
               (order_id, food_id, quantity, price)
               VALUES ?`,
              [orderItemRows],
              (err) => {
                if (err) {
                  return db.rollback(() =>
                    res.status(500).json({
                      error: "Could not save the ordered food items.",
                    })
                  );
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() =>
                      res.status(500).json({
                        error: "Could not complete the order.",
                      })
                    );
                  }

                  res.status(201).json({
                    message: "Order placed successfully!",
                    orderId,
                    total,
                    status: "Order Placed",
                  });
                });
              }
            );
          }
        );
      });
    }
  );
});

app.get("/api/orders/:id", (req, res) => {
  const orderId = req.params.id;

  if (!/^\d+$/.test(orderId)) {
    return res.status(400).json({ error: "Invalid order ID." });
  }

  const orderQuery = `
    SELECT id, customer_name, phone, address,
           total_amount, status, created_at
    FROM orders
    WHERE id = ?
  `;

  db.query(orderQuery, [orderId], (err, orders) => {
    if (err) {
      return res.status(500).json({ error: "Could not fetch order." });
    }

    if (orders.length === 0) {
      return res.status(404).json({ error: "Order not found." });
    }

    const order = orders[0];

    const itemsQuery = `
      SELECT oi.food_id AS id, fi.name, fi.category,
             oi.quantity, oi.price
      FROM order_items oi
      JOIN food_items fi ON fi.id = oi.food_id
      WHERE oi.order_id = ?
    `;

    db.query(itemsQuery, [order.id], (err, items) => {
      if (err) {
        return res.status(500).json({ error: "Could not fetch order items." });
      }

      res.json({
        orderId: order.id,
        name: order.customer_name,
        phone: order.phone,
        address: order.address,
        total: Number(order.total_amount),
        status: order.status,
        date: order.created_at,
        items: items.map((item) => ({
          ...item,
          price: Number(item.price),
          emoji: "🍽️",
        })),
      });
    });
  });
});


app.get("/api/orders", (req, res) => {
  const query = `
    SELECT id AS orderId, customer_name AS name, phone,
           address, total_amount AS total, status, created_at AS date
    FROM orders
    ORDER BY created_at DESC
  `;

  db.query(query, (err, orders) => {
    if (err) {
      return res.status(500).json({ error: "Could not fetch orders." });
    }

    if (orders.length === 0) {
      return res.json([]);
    }

    const orderIds = orders.map((order) => order.orderId);

    const itemsQuery = `
      SELECT oi.order_id, oi.food_id AS id, fi.name,
             oi.quantity, oi.price
      FROM order_items oi
      JOIN food_items fi ON fi.id = oi.food_id
      WHERE oi.order_id IN (?)
    `;

    db.query(itemsQuery, [orderIds], (err, items) => {
      if (err) {
        return res.status(500).json({ error: "Could not fetch order items." });
      }

      const result = orders.map((order) => ({
        ...order,
        total: Number(order.total),
        items: items
          .filter((item) => item.order_id === order.orderId)
          .map((item) => ({
            ...item,
            price: Number(item.price),
            emoji: "🍽️",
          })),
      }));

      res.json(result);
    });
  });
});

app.patch("/api/orders/:id/status", (req, res) => {
  const { status } = req.body;

  const allowedStatuses = [
    "Order Placed",
    "Preparing Food",
    "Out for Delivery",
    "Delivered",
  ];

  if (!/^\d+$/.test(req.params.id) || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid order ID or status." });
  }

  db.query(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Could not update order status." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Order not found." });
      }

      res.json({ message: "Status updated successfully.", status });
    }
  );
});


app.get("/api/admin/summary", (req, res) => {
  const query = `
    SELECT
      COUNT(*) AS totalOrders,
      COALESCE(SUM(total_amount), 0) AS totalRevenue,
      SUM(CASE WHEN status = 'Order Placed' THEN 1 ELSE 0 END) AS placedOrders,
      SUM(CASE WHEN status = 'Preparing Food' THEN 1 ELSE 0 END) AS preparingOrders,
      SUM(CASE WHEN status = 'Out for Delivery' THEN 1 ELSE 0 END) AS deliveryOrders,
      SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) AS deliveredOrders
    FROM orders
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: "Unable to load dashboard summary.",
      });
    }

    const summary = results[0];

    res.json({
      totalOrders: Number(summary.totalOrders),
      totalRevenue: Number(summary.totalRevenue),
      placedOrders: Number(summary.placedOrders || 0),
      preparingOrders: Number(summary.preparingOrders || 0),
      deliveryOrders: Number(summary.deliveryOrders || 0),
      deliveredOrders: Number(summary.deliveredOrders || 0),
    });
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`BudgetBite server running on port ${PORT}`);
});
