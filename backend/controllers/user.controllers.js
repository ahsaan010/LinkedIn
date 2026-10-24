import uploadOnCloundinary from "../config/cloudinary.js"
import User from "../models/user.model.js"
import { logServerError } from "../config/logging.js"

export const getCurrentUser=async (req,res)=>{
    try {
        let id=req.userId
       const user=await User.findById(id).select("-password")
        if(!user){
            return res.status(401).json({message:"Your account is no longer available"})
        }
        return res.status(200).json(user)
    } catch (error) {
        logServerError("user.current_user_failed", error, req.requestId)
        return res.status(500).json({
            message: "Unable to load your account",
            requestId: req.requestId
        })
    }
}


export const updateProfile=async (req,res)=>{
    try {
        let {firstName,lastName,userName,headline,location,gender} =req.body
        let skills=req.body.skills?JSON.parse(req.body.skills):[]
        let education=req.body.education?JSON.parse(req.body.education):[]
        let experience=req.body.experience?JSON.parse(req.body.experience):[]
            let profileImage;
            let coverImage
            if(req.files.profileImage){
                 profileImage=await uploadOnCloundinary(req.files.profileImage[0].path)

            }
            if(req.files.coverImage){
                 coverImage=await uploadOnCloundinary(req.files.coverImage[0].path)

            }
        
            let user=await User.findByIdAndUpdate(req.userId,{
                firstName,lastName,userName,headline,location
            ,gender,skills,education,experience,profileImage,coverImage
            },{new:true}).select("-password")
            return res.status(200).json(user)

    } catch (error) {
          logServerError("user.update_profile_failed", error, req.requestId)
          return res.status(500).json({
              message: "Unable to update your profile",
              requestId: req.requestId
          })
    }
}


export const getprofile=async (req,res)=>{
    try {
         let {userName}=req.params
         let user=await User.findOne ({userName}).select("-password")
         if(!user){
            return res.status(400).json({message:"userName does not exist "})
         }
         return res.status(200).json(user)
    } catch (error) {
        logServerError("user.profile_failed", error, req.requestId)
        return res.status(500).json({
            message: "Unable to load this profile",
            requestId: req.requestId
        })
    }
}

export const search=async (req,res)=>{
    try {
        let {query}=req.query
         if(!query){
      return res.status(400).json({message:"query is required"})
         }
         let users=await User.find({
            $or:[
                {firstName:{$regex:query,$options:"i"}},
                {lastName:{$regex:query,$options:"i"}},
                {userName:{$regex:query,$options:"i"}},
                {skills:{$in:[query]}}
            ]
          }).select("-password")
         return res.status(200).json(users)
    } catch (error) {
        logServerError("user.search_failed", error, req.requestId)
        return res.status(500).json({
            message: "Unable to search users",
            requestId: req.requestId
        })
    }
}

export const getSuggestedUser=async (req,res)=>{
    try {
        let currentUser=await User.findById(req.userId).select("connection")

        let suggestedUsers=await User.find({
            _id:{
                $ne:currentUser,$nin:currentUser.connection
                
            }
            }).select("-password")
            
        return res.status(200).json(suggestedUsers)
    } catch (error) {
        logServerError("user.suggested_users_failed", error, req.requestId)
        return res.status(500).json({
            message: "Unable to load suggested users",
            requestId: req.requestId
        })
    }
}
