const router = require("express").Router();
const userController = require("../../controllers/user/userControllers");
const upload = require("../../middleware/upload");
const authGuard = require("../../middleware/authGuard");

router.post("/register", userController.createUser);

router.post("/login", userController.loginUser);

router.post("/number-verify", userController.numberVerification);

router.get("/getUserById/:id", userController.getUserById);

router.put("/uploadImage/:id", upload.single("userImage"), userController.uploadImage);

router.put("/editProfile/:id", userController.updateUser);

router.put("/editPassword/:id", userController.updateUserPassword);

router.put('/storeFCMToken', authGuard, userController.storeFCMToken);

module.exports = router;
