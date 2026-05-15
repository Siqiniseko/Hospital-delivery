const router=require("express").Router(); const Appointment=require("../models/Appointment"); const {protect,allowRoles}=require("../middleware/auth");
router.post("/",protect,allowRoles("patient"),async(req,res)=>res.status(201).json(await Appointment.create({...req.body,patient:req.user._id})));
router.get("/mine",protect,allowRoles("patient"),async(req,res)=>res.json(await Appointment.find({patient:req.user._id}).sort({date:1})));
router.get("/",protect,allowRoles("admin","doctor"),async(req,res)=>res.json(await Appointment.find().populate("patient","name email phone").sort({date:1})));
router.patch("/:id",protect,allowRoles("admin","doctor"),async(req,res)=>res.json(await Appointment.findByIdAndUpdate(req.params.id,req.body,{new:true})));
module.exports=router;
