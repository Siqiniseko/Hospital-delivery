require("dotenv").config(); const mongoose=require("mongoose"); const bcrypt=require("bcryptjs"); const User=require("./models/User"); const Inventory=require("./models/Inventory");
(async()=>{await mongoose.connect(process.env.MONGO_URI); await User.deleteMany({}); await Inventory.deleteMany({}); const password=await bcrypt.hash("Password123!",12);
 await User.create([{name:"Admin User",email:"admin@hospital.com",password,role:"admin"},{name:"Driver One",email:"driver@hospital.com",password,role:"driver",phone:"0710000000"},{name:"Patient One",email:"patient@hospital.com",password,role:"patient",address:"Durban, South Africa"}]);
 await Inventory.create([{pillName:"Paracetamol",stock:120,lowStockThreshold:20,supplier:"MedSupply"},{pillName:"Amoxicillin",stock:30,lowStockThreshold:15,supplier:"CarePharma"},{pillName:"Insulin",stock:8,lowStockThreshold:10,supplier:"ColdChain Pharma"}]);
 console.log("Seed complete. Password for all: Password123!"); process.exit();})();
