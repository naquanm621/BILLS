const express = require('express');
const router = express.Router();
const upload = require('../services/upload.service');
const billsController = require('../controllers/bills.controller');

router.post('/', upload.single('billImage'), billsController.uploadBill);
router.get('/', billsController.getBills);
router.delete('/:id', billsController.deleteBill);

module.exports = router;
