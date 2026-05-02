const express = require('express');
const router = express.Router();
const billController = require('../controllers/bills.controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Make sure these match the names in your controller exactly!
router.post('/', upload.single('billImage'), billController.uploadBill);
router.get('/', billController.getBills);
router.patch('/:id', billController.updateBill);
router.delete('/:id', billController.deleteBill);

module.exports = router;
