const jwt=require("jsonwebtoken"); const User=require("../models/User");
async function protect(req,res,next){try{const h=req.headers.authorization||""; const t=h.startsWith("Bearer ")?h.slice(7):null;
 if(!t)return res.status(401).json({message:"Not authorized"}); const d=jwt.verify(t,process.env.JWT_SECRET);
 const u=await User.findById(d.id).select("-password"); if(!u)return res.status(401).json({message:"User not found"});
 req.user=u; next();}catch(e){res.status(401).json({message:"Invalid token"});}}
function allowRoles(...roles){return (req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({message:"Forbidden"});}
module.exports={protect,allowRoles};
