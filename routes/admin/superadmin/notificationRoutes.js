const router = require("express").Router();
const notificationController = require('../../../controllers/admin/superadmin/notificationControllers')
const authGuard = require("../../../middleware/authGuard");
const ensureSuperAdmin = require("../../../middleware/ensureSuperAdmin");

router.get('/countAndGrowth', authGuard, ensureSuperAdmin, notificationController.notificationCountAndGrowthRate);

module.exports = router;