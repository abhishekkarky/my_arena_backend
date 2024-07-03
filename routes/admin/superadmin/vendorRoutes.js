const authGuard = require("../../../middleware/authGuard");
const ensureSuperAdmin = require("../../../middleware/ensureSuperAdmin");
const vendorController = require('../../../controllers/admin/superadmin/vendorControllers')

const router = require("express").Router();

router.get('/all', authGuard, ensureSuperAdmin, vendorController.getAllVendorsForAdmin);

router.get('/countryCount', authGuard, ensureSuperAdmin, vendorController.getCountryVendor);

router.get('/countForGraph', authGuard, ensureSuperAdmin, vendorController.vendorCountForGraph);

router.get('/countAndGrowth', authGuard, ensureSuperAdmin, vendorController.vendorCountAndGrowthRate);

router.get('/blockUnblock/:id', authGuard, ensureSuperAdmin, vendorController.blockUnblockUserAndVendor);

module.exports = router;