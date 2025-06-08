const express = require("express");
const { login, logout } = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const { loginValidation } = require("../middleware/validation");
const router = express.Router();

router.post("/login", loginValidation, login);

router.post("/logout", auth, logout);

module.exports = router;
