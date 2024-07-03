const router = require("express").Router();
const authGuard = require("../../../middleware/authGuard");
const futsalController = require("../../../controllers/admin/superadmin/futsalControllers");
const ensureSuperAdmin = require("../../../middleware/ensureSuperAdmin");

router.get("/all", authGuard, ensureSuperAdmin, futsalController.getAllFutsalsForAdmin);

router.get("/countAndGrowth", authGuard, ensureSuperAdmin, futsalController.futsalCountAndGrowthRate);

router.delete("/delete/:id", authGuard, ensureSuperAdmin, futsalController.deleteFutsal);

module.exports = router