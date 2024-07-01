const router = require("express").Router();
const userController = require("../../controllers/user/userControllers");

router.post("/register", userController.createUser);

router.post("/login", userController.loginUser);

router.post("/number-verify", userController.numberVerification);

router.get("/getUserById/:id", userController.getUserById);

module.exports = router;
