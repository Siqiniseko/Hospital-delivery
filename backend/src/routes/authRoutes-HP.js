const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const token = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role });

router.post("/register", async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) return res.status(409).json({ message: "Email already registered" });

  const password = await bcrypt.hash(req.body.password, 12);
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    password,
    role: "patient",
  });

  res.status(201).json({ token: token(user), user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(401).json({ message: "Invalid login" });

  const ok = await bcrypt.compare(req.body.password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid login" });

  res.json({ token: token(user), user: publicUser(user) });
});

module.exports = router;
