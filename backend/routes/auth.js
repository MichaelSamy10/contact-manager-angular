const express = require("express");
const {
  login,
  getMe,
  logout,
  verifyToken,
} = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const { loginValidation } = require("../middleware/validation");
const router = express.Router();

router.post("/login", loginValidation, login);

router.get("/me", auth, getMe);

router.post("/logout", auth, logout);

router.get("/verify", auth, verifyToken);

module.exports = router;
