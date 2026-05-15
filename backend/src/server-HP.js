require("dotenv").config(); const express=require("express"); const http=require("http"); const cors=require("cors"); const helmet=require("helmet"); const morgan=require("morgan"); const rateLimit=require("express-rate-limit"); const mongoose=require("mongoose"); const {Server}=require("socket.io"); const registerTrackingSocket=require("./socket/trackingSocket");
const app=express(); const server=http.createServer(app); const io=new Server(server,{cors:{origin:process.env.CLIENT_URL||"*"}});
app.use(helmet()); app.use(cors({origin:process.env.CLIENT_URL||"*"})); app.use(express.json({limit:"1mb"})); app.use(morgan("dev")); app.use(rateLimit({windowMs:15*60*1000,max:300}));
app.get("/health",(_,res)=>res.json({ok:true,service:"hospital-delivery-level3"}));
app.use("/api/auth",require("./routes/authRoutes")); app.use("/api/appointments",require("./routes/appointmentRoutes")); app.use("/api/pills",require("./routes/pillRoutes")); app.use("/api/deliveries",require("./routes/deliveryRoutes")); app.use("/api/clinics",require("./routes/clinicRoutes")); app.use("/api/site",require("./routes/siteRoutes"));
registerTrackingSocket(io);
mongoose.connect(process.env.MONGO_URI).then(()=>server.listen(process.env.PORT||5000,()=>console.log("Level 3 API running"))).catch(e=>{console.error(e);process.exit(1);});
