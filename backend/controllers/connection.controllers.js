import User from "../models/user.model.js"
import {io} from "../index.js"
import Connection from "../models/connection.model.js"
import Notification from "../models/notification.model.js"
import { logServerError } from "../config/logging.js"



export const sendConnection= async (req,res)=>{
   try {
       let {id}=req.params
       let sender=req.userId
   let user=await User.findById(sender)

   if(sender==id){
      return res.status(400).json({message:"you can not send connection request to yourself"})
    }
    if(user.connection.includes(id)){
      return res.status(400).json({message:"you are already connected with this user"})
    }

    let existingConnection=await Connection.findOne({
        sender,
        receiver:id,
        status:"pending"
    })
    if(existingConnection){
        return res.status(400).json({message:"connection request already sent"})
    }

     await Connection.create({
        sender,
        receiver:id,
     })

    io.to(String(sender)).emit("statusUpdate", {
      updatedUserId: String(id),
      newStatus: "pending"
    })
    io.to(String(id)).emit("statusUpdate", {
      updatedUserId: String(sender),
      newStatus: "received"
    })


     return res.status(200).json({message:"connection accepted"})
   } catch (error) {
    logServerError("connection.send_failed", error, req.requestId)
    return res.status(500).json({ message: "Unable to send connection request", requestId: req.requestId })
   }

}

export const acceptConnection=async (req,res)=>{
        try{
         let {connectionId}=req.params
         let connection=await Connection.findById(connectionId)
 
         if(!connection){
            return res.status(400).json({message:"connection request not exist"})
         }
         if(connection.status!="pending"){
            return res.status(400).json({message:" request under process"})
         }
         
         connection.status="accepted"
         let notification=await Notification.create({
            receiver:connection.sender,
            type:"connectionAccepted",
            relatedUser:req.userId,
            
         })
         await connection.save()
         await User.findByIdAndUpdate(req.userId,{
            $addToSet:{connection:connection.sender._id}
         })
         await User.findByIdAndUpdate(connection.sender._id,{
            $addToSet:{connection:req.userId}
         })

         return res.status(200).json({message:"connection accepted"})

        } catch (error) {
            logServerError("connection.accept_failed", error, req.requestId)
            return res.status(500).json({ message: "Unable to accept connection request", requestId: req.requestId })
        }

}





export const rejectConnection=async (req,res)=>{
        try{
         let {connectionId}=req.params
         let connection=await Connection.findById(connectionId)
 
         if(!connection){
            return res.status(400).json({message:"connection request not exist"})
         }
         if(connection.status!="pending"){
            return res.status(400).json({message:" request under process"})
         }
         
         connection.status="rejected"
         await connection.save()
      
        
         return res.status(200).json({message:"connection rejected"})

        } catch (error) {
            logServerError("connection.reject_failed", error, req.requestId)
            return res.status(500).json({ message: "Unable to reject connection request", requestId: req.requestId })
        }

}

export const getConnectionStatus=async (req,res)=>{
    try{
        const targetUserId=req.params.userId;
        const currentUserId=req.userId;

        let currentUser=await User.findById(currentUserId)
        if(currentUser.connection.includes(targetUserId)){
         return res.json({status:"disconnect"});
        }

        const pendingRequest=await Connection.findOne({
           $or:[
            {sender:currentUserId,receiver:targetUserId,status:"pending"},
            {sender:targetUserId,receiver:currentUserId,status:"pending"}
            ],
            status:"pending",
        })
        
        if(pendingRequest){
            if(pendingRequest.sender.toString()===currentUserId.toString()){
                return res.json({status:"pending"});
            }else{
                return res.json({status:"received", requestId:pendingRequest._id});
            }
         }
          // if no connection or pending found
         return res.json({status:"connect"});   
    } catch (error) {
         logServerError("connection.status_failed", error, req.requestId)
         return res.status(500).json({
             message: "Unable to load connection status",
             requestId: req.requestId
         });

    }
};

export const removeConnection=async (req,res)=>{
    try {
      const myId = req.userId;
      const otherUserId = req.params.userId;

      await User.findByIdAndUpdate(myId, { $pull: { connection: otherUserId } });
      await User.findByIdAndUpdate(otherUserId, { $pull: { connection: myId } });
         
      io.to(String(otherUserId)).emit("statusUpdate", {
        updatedUserId: String(myId),
        newStatus: "connect"
      })
      io.to(String(myId)).emit("statusUpdate", {
        updatedUserId: String(otherUserId),
        newStatus: "connect"
      })

      return res.json({ message: "Connection removed successfully" });
      
    } catch (error) {
       logServerError("connection.remove_failed", error, req.requestId)
       return res.status(500).json({
         message: "Unable to remove connection",
         requestId: req.requestId
       });
    }
};

export const getConnectionRequests=async (req,res)=>{
    try {
        const userId=req.userId; 

        const requests=await Connection.find({  receiver:userId, status:
          "pending" }).populate("sender","firstName lastName email profileImage headline ")  

      return res.status(200).json(requests);
    } catch (error) {
        logServerError("connection.requests_failed", error, req.requestId)
        return res.status(500).json({
            message: "Unable to load connection requests",
            requestId: req.requestId
        });

    }

 };


 export const getUserConnections=async (req,res)=>{
    try{
         const userId=req.userId;
         
         const user=await User.findById(userId).populate(
            "connection",
            "firstName lastName userName connection profileImage headline ");
          
            return res.status(200).json(user.connection);
    } catch (error) {
        logServerError("connection.list_failed", error, req.requestId)
        return res.status(500).json({
            message: "Unable to load connections",
            requestId: req.requestId
        });

    }

};
