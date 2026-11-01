const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Mandatory Customer Authentication for placing an order
router.post('/', verifyToken, createOrder);

// Customer fetching personal order history
router.get('/my', verifyToken, getMyOrders);

// Tracking single order (Protected: requires login and verifies customer ownership or admin role)
router.get('/:orderId', verifyToken, getOrderById);

// Admin listing all orders
router.get('/', verifyToken, verifyAdmin, getAllOrders);

// Admin updating status
router.patch('/:orderId/status', verifyToken, verifyAdmin, updateOrderStatus);

module.exports = router;
