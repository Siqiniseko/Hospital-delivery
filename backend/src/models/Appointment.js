const mongoose=require("mongoose");
const schema=new mongoose.Schema({
 patient:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}, doctorName:String, reason:String,
 date:{type:Date,required:true}, status:{type:String,enum:["pending","approved","completed","cancelled"],default:"pending"}
},{timestamps:true});
module.exports=mongoose.model("Appointment",schema);
