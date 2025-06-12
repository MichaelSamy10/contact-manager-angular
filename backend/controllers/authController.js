const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
        });
        await user.save();
      }
    }

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials" });
    }

    // check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials" });
    }

    // generate token
    const token = generateToken(user._id);
    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
        },
      },
    });
  } catch (error) {
    console.error("Login error ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const logout = async (req, res) => {
  res.json({
    success: true,
    message: "Logout successful",
  });
};

module.exports = {
  login,
  logout,
};
