const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  addAddress,
  deleteAddress
} = require('../controllers/profileController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/address', addAddress);
router.delete('/address/:addressId', deleteAddress);

module.exports = router;
