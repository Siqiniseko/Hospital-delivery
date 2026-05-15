const mongoose=require("mongoose");
const schema=new mongoose.Schema({
 pillName:{type:String,required:true,unique:true}, stock:{type:Number,default:0},
 lowStockThreshold:{type:Number,default:10}, supplier:String
},{timestamps:true});
module.exports=mongoose.model("Inventory",schema);
