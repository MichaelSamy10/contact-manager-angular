const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    let user = await User.findOne({ username });

    if (!user) {
      const hardcodedUsers = [
        {
          username: "user10",
          password: "user10",
        },
        {
          username: "user20",
          password: "user20",
        },
      ];

      const hardcodedUser = hardcodedUsers.find((u) => u.username === username);
      if (hardcodedUser) {
        user = new User({
          username: hardcodedUser.username,
          password: hardcodedUser.password,
          role: "user",
        });
        await user.save();
      }
    }

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials" });
    }

    // Generate token
    const token = generateToken(user._id);
    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user data",
    });
  }
};

const logout = async (req, res) => {
  res.json({
    success: true,
    message: "Logout successful",
  });
};

const verifyToken = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Token is valid",
      data: {
        user: {
          id: req.user._id,
          username: req.user.username,
          role: req.user.role,
        },
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during token verification",
    });
  }
};

module.exports = {
  login,
  getMe,
  logout,
  verifyToken,
};
