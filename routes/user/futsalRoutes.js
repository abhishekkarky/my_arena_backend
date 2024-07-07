const router = require("express").Router();
const authGuard = require("../../middleware/authGuard");
const futsalController = require("../../controllers/user/futsalControllers");

router.get('/all', futsalController.getAllFutsals);

module.exports = router