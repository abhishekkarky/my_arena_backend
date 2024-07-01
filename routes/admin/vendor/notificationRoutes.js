const router = require("express").Router();
const authGuard = require("../../../middleware/authGuard");
const notificationController = require("../../../controllers/admin/vendor/notificationControllers");
const ensureVendor = require("../../../middleware/ensureVendor");

router.get('/countAndGrowth', authGuard, ensureVendor, notificationController.notificationCountAndGrowthRate);

module.exports = router;