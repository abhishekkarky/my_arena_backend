const router = require("express").Router();
const authGuard = require("../../../middleware/authGuard");
const upload = require("../../../middleware/upload");
const futsalController = require("../../../controllers/admin/vendor/futsalControllers");
const ensureVendor = require("../../../middleware/ensureVendor");

router.post("/add", authGuard, ensureVendor, upload.single("futsalImage"), futsalController.createFutsal);

router.get("/all", authGuard, ensureVendor, futsalController.getAllFutsals);

router.get("/get/:id", authGuard, ensureVendor, futsalController.getFutsalById);

router.put("/update/:id", authGuard, ensureVendor, upload.single("futsalImage"), futsalController.updateFutsal);

router.delete("/delete/:id", authGuard, ensureVendor, futsalController.deleteFutsal);

router.get('/countForGraph', authGuard, ensureVendor, futsalController.futsalCountForGraph);

router.get('/countAndGrowth', authGuard, ensureVendor, futsalController.futsalCountAndGrowthRate);

router.get('/forBooking', authGuard, ensureVendor, futsalController.getAllFutsalForBooking);

module.exports = router