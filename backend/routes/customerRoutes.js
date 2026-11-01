const express = require('express');
const router = express.Router();
const { getCustomers } = require('../controllers/customerController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/', verifyToken, verifyAdmin, getCustomers);

module.exports = router;
