const router = require("express").Router();
const Appointment = require("../models/Appointment");
const PillOrder = require("../models/PillOrder");
const Inventory = require("../models/Inventory");
const Delivery = require("../models/Delivery");
const ContactMessage = require("../models/ContactMessage");
const BlogPost = require("../models/BlogPost");
const { protect, allowRoles } = require("../middleware/auth");

router.get("/stats", async (_req, res) => {
  const [appointments, pillOrders, lowStock, activeDeliveries] = await Promise.all([
    Appointment.countDocuments(),
    PillOrder.countDocuments(),
    Inventory.countDocuments({ $expr: { $lte: ["$stock", "$lowStockThreshold"] } }),
    Delivery.countDocuments({ status: { $in: ["assigned", "picked_up", "on_the_way"] } }),
  ]);

  res.json({
    appointments,
    pillOrders,
    lowStock,
    activeDeliveries,
    uptime: "99%",
  });
});

router.get("/blog", async (_req, res) => {
  const posts = await BlogPost.find().sort({ isFeatured: -1, publishedAt: -1 });
  res.json(posts);
});

router.post("/contact", async (req, res) => {
  const message = await ContactMessage.create({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
  });
  res.status(201).json({ message: "Contact message received", id: message._id });
});

router.get("/contact", protect, allowRoles("admin"), async (_req, res) => {
  res.json(await ContactMessage.find().sort({ createdAt: -1 }));
});

module.exports = router;
