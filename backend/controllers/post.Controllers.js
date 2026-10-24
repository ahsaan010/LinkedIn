import uploadOnCloundinary from "../config/cloudinary.js";
import Post from "../models/post.model.js"
import {io} from "../index.js"
import Notification from "../models/notification.model.js";
import { logServerError } from "../config/logging.js"

export const createPost=async (req,res)=>{
    try {
        let {description}=req.body
        let newPost;
     if(req.file){
         let image=await uploadOnCloundinary(req.file.path)
         newPost=await Post.create({
            author:req.userId,
            description,
            image
         })
   }else{
        newPost=await Post.create({
             author:req.userId,
            description
         })
   }
   return res.status(201).json(newPost)
   
} catch (error) {
       logServerError("post.create_failed", error, req.requestId)
       return res.status(500).json({
           message: "Unable to create post",
           requestId: req.requestId
       })
        
    }

   }


export const getPost =async (req,res)=>{
   try {
      const post=await Post.find()
      .populate("author","firstName lastName profileImage headline userName ")
       .populate("comment.user", "firstName lastName profileImage headline ")
      .sort({createdAt:-1})
      return res.status(200).json(post)
   } catch (error) {
      logServerError("post.get_failed", error, req.requestId)
      return res.status(500).json({
          message: "Unable to load posts",
          requestId: req.requestId
      })
      
   }
 
}


export const like =async (req,res)=>{
   try {
        let postId=req.params.id
        let userId=req.userId

        let post =await Post.findById(postId)
        if(!post){
         return res.status(400).json({message:"post not found"})
        }
        if(post.like.includes(userId)){
         post.like=post.like.filter((id)=>id!=userId)
       }else{
         post.like.push(userId)
         if(post.author!=userId){
         let notification=await Notification.create({
            receiver:post.author,
            type:"like",
            relatedUser:userId,
            relatedPost:postId
         })
       }
      }
       await post.save()
       io.emit("likeUpdated",{postId,likes:post.like})
      
      return res.status(200).json(post)
     
   } catch (error) {
      logServerError("post.like_failed", error, req.requestId)
      return res.status(500).json({
          message: "Unable to update post",
          requestId: req.requestId
      })
   }
}


export const comment =async (req,res)=>{
  try {
   let postId=req.params.id
   let userId=req.userId
   let {content}=req.body

   let post=await Post.findByIdAndUpdate(postId,{
      $push:{comment:{content,user:userId}}
   },{new:true})
       .populate("comment.user","firstName lastName profileImage headline")
       if(post.author!=userId){
       let notification=await Notification.create({
            receiver:post.author,
            type:"comment",
            relatedUser:userId,
            relatedPost:postId
         })
      }
    
      io.emit("commentAdded",{postId,comm:post.comment})  
   return res.status(200).json(post)

} catch (error) {
    logServerError("post.comment_failed", error, req.requestId)
    return res.status(500).json({
        message: "Unable to add comment",
        requestId: req.requestId
    })
  }




}

