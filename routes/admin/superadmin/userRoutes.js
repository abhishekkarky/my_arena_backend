const authGuard = require("../../../middleware/authGuard");
const ensureSuperAdmin = require("../../../middleware/ensureSuperAdmin");
const userController = require('../../../controllers/admin/superadmin/userControllers')

const router = require("express").Router();

router.get('/all', authGuard, ensureSuperAdmin, userController.getAllUsersForAdmin);

router.get('/countryCount', authGuard, ensureSuperAdmin, userController.getCountryUser);

router.get('/countForGraph', authGuard, ensureSuperAdmin, userController.userCountForGraph);

router.get('/countAndGrowth', authGuard, ensureSuperAdmin, userController.userCountAndGrowthRate);

module.exports = router;