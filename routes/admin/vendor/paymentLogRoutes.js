const router = require("express").Router();
const authGuard = require("../../../middleware/authGuard");
const paymentLogController = require("../../../controllers/admin/vendor/paymentLogControllers");
const ensureVendor = require("../../../middleware/ensureVendor");

router.get('/all', authGuard, ensureVendor, paymentLogController.getAllPaymentLogs);

router.get('/revenueTotals', authGuard, ensureVendor, paymentLogController.getRevenueTotals);

router.get('/revenueForGraph', authGuard, ensureVendor, paymentLogController.getRevenueDataForGraph);

module.exports = router;