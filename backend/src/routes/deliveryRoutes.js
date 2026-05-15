const router=require("express").Router(); const Delivery=require("../models/Delivery"); const PillOrder=require("../models/PillOrder"); const {protect,allowRoles}=require("../middleware/auth");
router.post("/",protect,allowRoles("admin"),async(req,res)=>{const d=await Delivery.create(req.body); await PillOrder.findByIdAndUpdate(req.body.pillOrder,{status:"out_for_delivery"}); res.status(201).json(d);});
router.get("/",protect,allowRoles("admin","driver"),async(req,res)=>{const f=req.user.role==="driver"?{driver:req.user._id}:{}; res.json(await Delivery.find(f).populate("patient","name phone address").populate("driver","name phone").populate("pillOrder","pillName dosage quantity status").sort({createdAt:-1}));});
router.get("/:id/track",protect,async(req,res)=>res.json(await Delivery.findById(req.params.id).populate("driver","name phone").populate("pillOrder","pillName status")));
router.patch("/:id",protect,allowRoles("admin","driver"),async(req,res)=>res.json(await Delivery.findByIdAndUpdate(req.params.id,req.body,{new:true})));
module.exports=router;
