const express = require('express');
const router = express.Router();
const {
  getCombos,
  getComboById,
  createCombo,
  updateCombo,
  deleteCombo
} = require('../controllers/comboController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getCombos);
router.get('/:id', getComboById);
router.post('/', verifyToken, verifyAdmin, upload.single('image'), createCombo);
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), updateCombo);
router.delete('/:id', verifyToken, verifyAdmin, deleteCombo);

module.exports = router;
