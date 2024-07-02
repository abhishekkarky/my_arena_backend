const authGuard = require("../../../middleware/authGuard");
const ensureSuperAdmin = require("../../../middleware/ensureSuperAdmin");
const paymentLogsController = require("../../../controllers/admin/superadmin/paymentLogsControllers");

const router = require("express").Router();

router.get('/all', authGuard, ensureSuperAdmin, paymentLogsController.getAllPaymentsForAdmin);

router.get('/revenueTotal', authGuard, ensureSuperAdmin, paymentLogsController.getRevenueTotals);

module.exports = router;