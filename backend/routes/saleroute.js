const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

router.get('/sale-reports', salesController.getSalesReports);
router.get('/download-sales-report', salesController.downloadSalesReport);

module.exports = router;

