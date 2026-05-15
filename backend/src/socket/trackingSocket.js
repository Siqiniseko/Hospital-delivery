const Delivery=require("../models/Delivery");
function registerTrackingSocket(io){io.on("connection",socket=>{
 socket.on("join-delivery",({deliveryId})=>socket.join(`delivery:${deliveryId}`));
 socket.on("driver-location",async({deliveryId,driverId,lat,lng,etaMinutes})=>{
  const payload={deliveryId,driverId,lat,lng,etaMinutes,updatedAt:new Date()};
  if(deliveryId){await Delivery.findByIdAndUpdate(deliveryId,{currentLocation:{lat,lng,updatedAt:new Date()},etaMinutes,status:"on_the_way"}).catch(()=>{});
   io.to(`delivery:${deliveryId}`).emit("driver-move",payload);}
  io.emit("admin-driver-move",payload);
 });
});}
module.exports=registerTrackingSocket;
