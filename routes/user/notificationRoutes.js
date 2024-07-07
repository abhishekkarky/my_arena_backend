const router = require("express").Router();
const notificationController = require("../../controllers/user/notificationControllers");
const authGuard = require("../../middleware/authGuard");

router.get('/all', authGuard, notificationController.getAllNotification);

router.post('/markRead', authGuard, notificationController.markAllNotificationsAsRead);

module.exports = router;
