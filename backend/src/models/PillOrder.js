const mongoose=require("mongoose");
const schema=new mongoose.Schema({
 patient:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}, pillName:{type:String,required:true},
 dosage:String, quantity:{type:Number,default:1}, collectionDate:Date,
 deliveryType:{type:String,enum:["collection","delivery"],default:"collection"},
 status:{type:String,enum:["requested","approved","preparing","ready","out_for_delivery","collected","delivered","cancelled"],default:"requested"}
},{timestamps:true});
module.exports=mongoose.model("PillOrder",schema);
