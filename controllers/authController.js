const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const saltRounds = 10;
const login = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) res.status(400).json({ messge: "user not found" });
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      res.status(403).json({ message: "Not authorized" });
    }
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_KEY,
      { expiresIn: "90d" }
    );

    const { password, ...userWithoutPassword } = user.toObject();
    res.status(200).json({
      status: "ok",
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    res.status(404).json({ message: "user not found" });
  }
};

const createUser = async (req, res) => {
  try {
    req.body.password = await bcrypt.hash(req.body.password, saltRounds);
    const newUser = await User.create(req.body);

    const { password, ...userWithoutPassword } = newUser.toObject();
    return res.status(201).json({
      status: "ok",
      user: userWithoutPassword,
    });
  } catch (err) {
    return res.status(400).json({
      message: `user is not created ${err}`,
    });
  }
};

module.exports = { login, createUser };
