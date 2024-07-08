const router = require("express").Router();
const authGuard = require("../../middleware/authGuard");
const bookingController = require("../../controllers/user/bookingControllers");

router.get('/all', authGuard, bookingController.getAllBookings);

router.post('/add', authGuard, bookingController.createBooking);

module.exports = router;
