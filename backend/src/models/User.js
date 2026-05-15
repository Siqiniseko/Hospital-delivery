const mongoose=require("mongoose");
const schema=new mongoose.Schema({
 name:{type:String,required:true}, email:{type:String,required:true,unique:true,lowercase:true},
 password:{type:String,required:true}, phone:String, address:String,
 role:{type:String,enum:["patient","driver","doctor","admin"],default:"patient"}, isActive:{type:Boolean,default:true}
},{timestamps:true});
module.exports=mongoose.model("User",schema);
