const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  fromClinic: { type: String, required: true },
  toClinic: { type: String, required: true },
  quantity: { type: Number, required: true },
  etaMinutes: Number,
  qrCode: { type: String, required: true },
  status: { type: String, enum: ["planned", "sms_sent", "completed", "cancelled"], default: "planned" },
  smsLog: [String],
  completedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("RedistributionMission", schema);
