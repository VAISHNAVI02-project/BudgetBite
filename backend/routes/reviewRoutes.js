const express = require('express');
const router = express.Router();
const { createReview, getReviews } = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/auth');

router.get('/', getReviews);
router.post('/', verifyToken, createReview);

module.exports = router;
