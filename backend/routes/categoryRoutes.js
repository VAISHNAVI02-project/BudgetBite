const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/categoryController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/', getCategories);
router.post('/', verifyToken, verifyAdmin, createCategory);

module.exports = router;
