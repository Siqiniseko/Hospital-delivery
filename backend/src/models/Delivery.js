const mongoose=require("mongoose");
const schema=new mongoose.Schema({
 pillOrder:{type:mongoose.Schema.Types.ObjectId,ref:"PillOrder",required:true},
 patient:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 driver:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
 pickupAddress:String, dropoffAddress:String,
 status:{type:String,enum:["assigned","picked_up","on_the_way","arrived","delivered","failed"],default:"assigned"},
 currentLocation:{lat:Number,lng:Number,updatedAt:Date}, etaMinutes:Number, otpCode:String, deliveredAt:Date
},{timestamps:true});
module.exports=mongoose.model("Delivery",schema);
