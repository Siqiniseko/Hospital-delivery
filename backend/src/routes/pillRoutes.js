const router=require("express").Router(); const PillOrder=require("../models/PillOrder"); const Inventory=require("../models/Inventory"); const {protect,allowRoles}=require("../middleware/auth");
router.post("/orders",protect,allowRoles("patient"),async(req,res)=>res.status(201).json(await PillOrder.create({...req.body,patient:req.user._id})));
router.get("/orders/mine",protect,allowRoles("patient"),async(req,res)=>res.json(await PillOrder.find({patient:req.user._id}).sort({createdAt:-1})));
router.get("/orders",protect,allowRoles("admin"),async(req,res)=>res.json(await PillOrder.find().populate("patient","name email phone address").sort({createdAt:-1})));
router.patch("/orders/:id",protect,allowRoles("admin"),async(req,res)=>res.json(await PillOrder.findByIdAndUpdate(req.params.id,req.body,{new:true})));
router.get("/inventory",protect,allowRoles("admin"),async(req,res)=>res.json(await Inventory.find().sort({pillName:1})));
router.post("/inventory",protect,allowRoles("admin"),async(req,res)=>res.json(await Inventory.findOneAndUpdate({pillName:req.body.pillName},req.body,{upsert:true,new:true})));
module.exports=router;
