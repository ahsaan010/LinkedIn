import Notification from "../models/notification.model.js"

export const getNotifications=async (req,res)=>{
    try {
        let notification=await Notification.find({receiver:req.userId})
        .populate("relatedUser","firstName lastName profileImage ")    
         .populate("relatedPost", "image description ")                   
        return res.status(200).json(notification)                      
    } catch (error) {
        return res.status(500).json({message:`get notification error ${error}`})
        
    }
}

export const deleteNotifications=async (req,res)=>{
    try {
           let {id}=req.params
        await Notification.findByIdAndDelete({
            _id:id,
            receiver:req.userId


        })
       
        return res.status(200).json({message: "notification deleted successfully"})                      
    } catch (error) {
        return res.status(500).json({message:`del notification error ${error}`})
        
    }
}
export const clearAllNotifications=async (req,res)=>{
    try {
        await Notification.deleteMany({
             receiver:req.userId
        })
        
        return res.status(200).json({message: "notification deleted successfully"})                      
    } catch (error) {
        return res.status(500).json({message:`clear all notification error ${error}`})
        
    }
}