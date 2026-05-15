const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  readTime: { type: String, default: "3 min read" },
  excerpt: { type: String, required: true },
  body: String,
  isFeatured: { type: Boolean, default: false },
  publishedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("BlogPost", schema);
