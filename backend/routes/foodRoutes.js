const express = require('express');
const router = express.Router();
const {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood
} = require('../controllers/foodController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getFoods);
router.get('/:id', getFoodById);
router.post('/', verifyToken, verifyAdmin, upload.single('image'), createFood);
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), updateFood);
router.delete('/:id', verifyToken, verifyAdmin, deleteFood);

module.exports = router;
