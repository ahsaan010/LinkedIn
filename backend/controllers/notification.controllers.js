import Notification from "../models/notification.model.js"
import { logServerError } from "../config/logging.js"

export const getNotifications=async (req,res)=>{
    try {
        let notification=await Notification.find({receiver:req.userId})
        .populate("relatedUser","firstName lastName profileImage ")    
         .populate("relatedPost", "image description ")                   
        return res.status(200).json(notification)                      
    } catch (error) {
        logServerError("notification.get_failed", error, req.requestId)
        return res.status(500).json({
            message: "Unable to load notifications",
            requestId: req.requestId
        })
        
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
        logServerError("notification.delete_failed", error, req.requestId)
        return res.status(500).json({
            message: "Unable to delete notification",
            requestId: req.requestId
        })
        
    }
}
export const clearAllNotifications=async (req,res)=>{
    try {
        await Notification.deleteMany({
             receiver:req.userId
        })
        
        return res.status(200).json({message: "notification deleted successfully"})                      
    } catch (error) {
        logServerError("notification.clear_failed", error, req.requestId)
        return res.status(500).json({
            message: "Unable to clear notifications",
            requestId: req.requestId
        })
        
    }
}