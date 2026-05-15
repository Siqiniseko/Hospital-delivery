const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  stock: { type: Number, default: 0 },
  avgDailyUsage: { type: Number, default: 1 },
  lat: { type: Number, default: 50 },
  lng: { type: Number, default: 50 },
}, { timestamps: true });

module.exports = mongoose.model("Clinic", schema);
