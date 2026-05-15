require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Inventory = require("./models/Inventory");
const Appointment = require("./models/Appointment");
const PillOrder = require("./models/PillOrder");
const Delivery = require("./models/Delivery");
const Clinic = require("./models/Clinic");
const RedistributionMission = require("./models/RedistributionMission");
const ContactMessage = require("./models/ContactMessage");
const BlogPost = require("./models/BlogPost");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await Inventory.deleteMany({});
  await Appointment.deleteMany({});
  await PillOrder.deleteMany({});
  await Delivery.deleteMany({});
  await Clinic.deleteMany({});
  await RedistributionMission.deleteMany({});
  await ContactMessage.deleteMany({});
  await BlogPost.deleteMany({});

  const password = await bcrypt.hash("Password123!", 12);
  const [admin, doctor, driver, patient] = await User.create([
    { name: "Admin User", email: "admin@hospital.com", password, role: "admin" },
    { name: "Dr Mkhize", email: "doctor@hospital.com", password, role: "doctor", phone: "0730000000" },
    { name: "Driver One", email: "driver@hospital.com", password, role: "driver", phone: "0710000000" },
    { name: "Patient One", email: "patient@hospital.com", password, role: "patient", phone: "0720000000", address: "Durban, South Africa" },
  ]);

  await Inventory.create([
    { pillName: "Paracetamol", stock: 120, lowStockThreshold: 20, supplier: "MedSupply" },
    { pillName: "Amoxicillin", stock: 30, lowStockThreshold: 15, supplier: "CarePharma" },
    { pillName: "Insulin", stock: 8, lowStockThreshold: 10, supplier: "ColdChain Pharma" },
  ]);

  await Clinic.create([
    { slug: "durban-central", name: "Durban Central Clinic", stock: 420, avgDailyUsage: 42, lat: 42, lng: 58 },
    { slug: "umlazi", name: "Umlazi Clinic", stock: 96, avgDailyUsage: 28, lat: 68, lng: 34 },
    { slug: "phoenix", name: "Phoenix Clinic", stock: 55, avgDailyUsage: 18, lat: 28, lng: 72 },
    { slug: "pinetown", name: "Pinetown Clinic", stock: 240, avgDailyUsage: 22, lat: 50, lng: 20 },
  ]);

  await BlogPost.create([
    {
      title: "What happens after a patient requests pills?",
      category: "Featured article",
      readTime: "4 min read",
      excerpt: "The hospital team can approve the request, prepare the medicine, mark it ready, and let the patient know whether to fetch it or follow a delivery driver.",
      isFeatured: true,
    },
    {
      title: "How patients can track pill readiness",
      category: "Pharmacy",
      readTime: "4 min read",
      excerpt: "See what each pill status means, from requested and approved to ready for pickup or delivery.",
    },
    {
      title: "Why appointment updates matter",
      category: "Doctor care",
      readTime: "3 min read",
      excerpt: "A clear appointment queue helps doctors prepare for patient visits and keep consultation progress visible.",
    },
    {
      title: "Safer medicine delivery with live tracking",
      category: "Delivery",
      readTime: "5 min read",
      excerpt: "Live location updates reduce uncertainty when drivers are delivering medication to patients.",
    },
  ]);

  await Appointment.create({
    patient: patient._id,
    doctorName: "Dr Mkhize",
    reason: "Follow-up consultation",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: "approved",
  });

  const pillOrder = await PillOrder.create({
    patient: patient._id,
    pillName: "Paracetamol",
    dosage: "500mg",
    quantity: 20,
    collectionDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    deliveryType: "collection",
    status: "ready",
  });

  await Delivery.create({
    pillOrder: pillOrder._id,
    patient: patient._id,
    driver: driver._id,
    pickupAddress: "City Hospital Pharmacy, Durban",
    dropoffAddress: patient.address,
    status: "assigned",
    etaMinutes: 12,
  });

  console.log("Seed complete. Password for all: Password123!");
  console.log(`Demo users ready: ${admin.email}, ${doctor.email}, ${driver.email}, ${patient.email}`);
  process.exit();
})();
