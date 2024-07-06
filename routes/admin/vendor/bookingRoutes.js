const router = require("express").Router();
const authGuard = require("../../../middleware/authGuard");
const bookingController = require("../../../controllers/admin/vendor/bookingControllers");
const ensureVendor = require("../../../middleware/ensureVendor");
const timeSlotController = require("../../../controllers/admin/vendor/timeSlotControllers");

router.post('/add', authGuard, ensureVendor, bookingController.addBooking);

router.get('/all', authGuard, ensureVendor, bookingController.getAllBookings);

router.get('/countForGraph', authGuard, ensureVendor, bookingController.bookingCountForGraph);

router.get('/countAndGrowth', authGuard, ensureVendor, bookingController.bookingCountAndGrowthRate);

router.get('/timeSlotForBooking', authGuard, ensureVendor, timeSlotController.getAllTimeSlotForBooking);

router.delete('/delete/:id', authGuard, ensureVendor, bookingController.deleteBooking);

router.get('/get/:id', authGuard, ensureVendor, bookingController.getBookingById);

router.put('/update/:id', authGuard, ensureVendor, bookingController.updateBooking);

module.exports = router;