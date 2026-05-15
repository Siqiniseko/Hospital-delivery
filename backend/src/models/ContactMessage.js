const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["new", "reviewed", "closed"], default: "new" },
}, { timestamps: true });

module.exports = mongoose.model("ContactMessage", schema);
