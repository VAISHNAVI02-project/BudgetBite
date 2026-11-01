const express = require('express');
const router = express.Router();
const { getDashboardOverview, getReports } = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.use(verifyToken, verifyAdmin);

router.get('/dashboard', getDashboardOverview);
router.get('/reports', getReports);

module.exports = router;
