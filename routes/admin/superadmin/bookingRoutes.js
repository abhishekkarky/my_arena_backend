const router = require("express").Router();
const authGuard = require("../../../middleware/authGuard");
const bookingController = require("../../../controllers/admin/superadmin/bookingControllers");
const ensureSuperAdmin = require("../../../middleware/ensureSuperAdmin");

router.get('/countForGraph', authGuard, ensureSuperAdmin, bookingController.bookingsCountForGraph);

router.get('/countAndGrowth', authGuard, ensureSuperAdmin, bookingController.bookingsCountAndGrowthRate);

module.exports = router