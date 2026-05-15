const router = require("express").Router();
const Clinic = require("../models/Clinic");
const RedistributionMission = require("../models/RedistributionMission");
const { protect, allowRoles } = require("../middleware/auth");

router.use(protect, allowRoles("admin"));

function enrichClinic(clinic) {
  const daysLeft = Math.floor(clinic.stock / Math.max(1, clinic.avgDailyUsage));
  const status = clinic.stock < clinic.avgDailyUsage * 3 ? "Crisis" : clinic.stock < clinic.avgDailyUsage * 7 ? "At Risk" : "Healthy";
  const score = Math.min(100, Math.round((daysLeft / 14) * 100));
  return {
    id: clinic.slug,
    name: clinic.name,
    stock: clinic.stock,
    avgDailyUsage: clinic.avgDailyUsage,
    lat: clinic.lat,
    lng: clinic.lng,
    daysLeft,
    status,
    score,
  };
}

async function clinicPayload() {
  const clinics = await Clinic.find().sort({ name: 1 });
  const enriched = clinics.map(enrichClinic);
  const networkScore = enriched.length
    ? Math.round(enriched.reduce((sum, clinic) => sum + clinic.score, 0) / enriched.length)
    : 0;
  return { clinics: enriched, networkScore };
}

router.get("/", async (_req, res) => {
  res.json(await clinicPayload());
});

router.get("/forecast", async (_req, res) => {
  res.json(await clinicPayload());
});

router.patch("/:slug/stock", async (req, res) => {
  const clinic = await Clinic.findOneAndUpdate(
    { slug: req.params.slug },
    { stock: Number(req.body.stock), avgDailyUsage: Number(req.body.avgDailyUsage) },
    { new: true, runValidators: true }
  );
  if (!clinic) return res.status(404).json({ message: "Clinic not found" });
  res.json(enrichClinic(clinic));
});

router.post("/redistributions", async (req, res) => {
  const from = await Clinic.findOne({ slug: req.body.fromClinic });
  const to = await Clinic.findOne({ slug: req.body.toClinic });
  if (!from || !to) return res.status(404).json({ message: "Clinic not found" });

  const quantity = Number(req.body.quantity);
  if (!quantity || quantity < 1) return res.status(400).json({ message: "Quantity must be greater than 0" });

  const etaMinutes = Math.max(18, Math.round(Math.abs(from.lat - to.lat) + Math.abs(from.lng - to.lng)));
  const qrCode = `MR-${from.slug.slice(0, 3).toUpperCase()}-${to.slug.slice(0, 3).toUpperCase()}-${quantity}-${Date.now().toString().slice(-4)}`;
  const mission = await RedistributionMission.create({
    fromClinic: from.slug,
    toClinic: to.slug,
    quantity,
    etaMinutes,
    qrCode,
  });

  res.status(201).json(formatMission(mission, from, to));
});

router.post("/redistributions/:id/sms", async (req, res) => {
  const mission = await RedistributionMission.findById(req.params.id);
  if (!mission) return res.status(404).json({ message: "Mission not found" });

  const [from, to] = await Promise.all([
    Clinic.findOne({ slug: mission.fromClinic }),
    Clinic.findOne({ slug: mission.toClinic }),
  ]);
  const smsLog = [
    `SMS to runner: Collect ${mission.quantity} pill packs from ${from.name}. Deliver to ${to.name}. ETA ${mission.etaMinutes} min.`,
    `SMS to patients: Medicine stock is being restored at ${to.name}. Please wait for pickup confirmation.`,
    `SMS to clinic: Runner assigned for ${mission.quantity} pill packs. QR mission code ${mission.qrCode}.`,
  ];

  mission.smsLog = smsLog;
  mission.status = "sms_sent";
  await mission.save();
  res.json({ smsLog, mission: formatMission(mission, from, to) });
});

router.post("/redistributions/:id/complete", async (req, res) => {
  const mission = await RedistributionMission.findById(req.params.id);
  if (!mission) return res.status(404).json({ message: "Mission not found" });
  if (mission.status === "completed") {
    const [from, to] = await Promise.all([
      Clinic.findOne({ slug: mission.fromClinic }),
      Clinic.findOne({ slug: mission.toClinic }),
    ]);
    return res.json({ mission: formatMission(mission, from, to), ...(await clinicPayload()) });
  }

  const [from, to] = await Promise.all([
    Clinic.findOne({ slug: mission.fromClinic }),
    Clinic.findOne({ slug: mission.toClinic }),
  ]);
  from.stock = Math.max(0, from.stock - mission.quantity);
  to.stock += mission.quantity;
  mission.status = "completed";
  mission.completedAt = new Date();

  await Promise.all([from.save(), to.save(), mission.save()]);
  res.json({ mission: formatMission(mission, from, to), ...(await clinicPayload()) });
});

function formatMission(mission, from, to) {
  return {
    id: mission._id,
    from: enrichClinic(from),
    to: enrichClinic(to),
    quantity: mission.quantity,
    eta: mission.etaMinutes,
    code: mission.qrCode,
    status: mission.status,
    smsLog: mission.smsLog,
  };
}

module.exports = router;
