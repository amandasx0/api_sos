const express = require("express");
const router = express.Router();
const controllerUsers = require("../controllers/userController");
const controllerLogin = require("../controllers/authController");
const validateUsers = require("../middlewares/validations/createUser");

router.post("/register", validateUsers, controllerUsers.createUser);
router.get("/users", controllerUsers.allUsers);
router.post("/login", controllerLogin.login);

module.exports = router;