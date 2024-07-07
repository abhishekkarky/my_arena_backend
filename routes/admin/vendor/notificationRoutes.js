const router = require("express").Router();
const authGuard = require("../../../middleware/authGuard");
const notificationController = require("../../../controllers/admin/vendor/notificationControllers");
const ensureVendor = require("../../../middleware/ensureVendor");

router.get('/countAndGrowth', authGuard, ensureVendor, notificationController.notificationCountAndGrowthRate);

router.get('/all', authGuard, notificationController.getAllNotification);

router.post('/markRead', authGuard, notificationController.markAllNotificationsAsRead);

module.exports = router;