import React,{useContext, useEffect, useState} from "react";
import Nav from "../components/Nav";
import { FaCamera } from "react-icons/fa";
import dp from "../assets/dp.jpg";
import { MdAdd } from "react-icons/md";

import { BiSolidPencil } from "react-icons/bi";
import EditProfile from "../components/EditProfile.jsx";
import { userDataContext } from "../context/UserContext.jsx";
import Post from "../components/Post.jsx";
import ConnectionButton from "../components/ConnectionButton.jsx";
  
function Profile() {

   let { userData,show,setShow,postData,profileData } = useContext(userDataContext);
   let [profilePost,setProfilePost]=useState([])

   
 

   useEffect(()=>{ 
      setProfilePost(postData.filter((post)=>post.author._id==profileData._id))
   },[profileData])
    

  return (
    <div className="w-full min-h-[100vh] bg-[#f0efe7] flex flex-col items-center pt-[100px] pb-[40px] ">
      <Nav />
      {show && <EditProfile/> } 
      <div className="w-full max-w-[900px] min-h-[100vh] flex flex-col gap-[10px] ">

        <div className="relative bg-white pb-[40px] rounded shadow-lg">
          <div className="w-[100%] h-[100px] bg-gray-400 rounded overflow-hidden flex
                                 items-center justify-center cursor-pointer "
            onClick={() => setShow(true)}
          >
            <img src={profileData.coverImage || " "} alt="" className="w-full "/>
            <FaCamera className="absolute right-[20px] top-[20px] w-[25px] h-[25px] text-white cursor-pointer  " />
          </div>

          <div
            className="w-[70px] h-[70px] rounded-full flex overflow-hidden items-center justify-center
                                absolute top-[65px] left-[35px]"
            onClick={() => setShow(true)}
          >
            <img
              src={profileData.profileImage || dp}
              alt=""
              className=" h-full  cursor-pointer"
            />
          </div>
          <div
            className="w-[20px] h-[20px] bg-[#17c1ff] absolute top-[105px] 
                             left-[90px] rounded-full flex justify-center items-center "
          >
            <MdAdd className="text-white" />
          </div>

          <div className="mt-[30px] pl-[20px] font-semibold text-gray-700">
            <div className=" text-[30px]">{`${profileData.firstName} ${profileData.lastName}`}</div>
            <div className="text-[18px] font-semibold text-gray-600">
              {userData.headline || ""}
            </div>
            <div className="text-[16px]  text-gray-500">
              {userData.location}
            </div>
            <div className="text-[16px]  text-gray-500">
              {`${profileData.connection.length} connection`}
            </div>
          </div>
        {profileData._id==userData._id && 
          <button
            className="min-w-[150px] h-[40px] my-[20px] rounded-full border-2 border-[#2dc0ff]
                             text-[#2dc0ff] flex items-center justify-center gap-[10px] ml-[20px]"
            onClick={() => setShow(true)}>
             Edit Profile
            <BiSolidPencil />{" "}
          </button>}
          {profileData._id!=userData._id && <div className="
          mt-[20px] ml-[20px]"><ConnectionButton userId={profileData._id}/> </div>}
        </div>

    <div className="w-full h-[100px] flex items-center p-[20px] text-[22px]
      text-gray-600 font-semibold bg-white shadow-lg rounded-lg">{`Post ${profilePost.length}`}</div>
     
   


     {
      profileData.skills.length>0 &&  <div  className="w-full min-h-[100px] flex flex-col gap-[10px] justify-center p-[20px] 
        font-semibold bg-white shadow-lg rounded-lg ">
          <div className=" text-[22px] text-gray-600" >Skills</div>
              <div className="flex flex-wrap justify-start items-center gap-[20px] p-[20px] text-gray-600">
            {profileData.skills.map((skill)=>(
              <div className="text-[20px]">{skill}</div>
            ))}
            {profileData._id==userData._id &&  <button  className="min-w-[150px] h-[40px] rounded-full border-2 border-[#2dc0ff]
                      text-[#2dc0ff] flex items-center justify-center gap-[10px] ml-[20px]"
                         onClick={()=>setShow(true)}    >
                       Add Skills</button> }
           
            </div>
           </div>
     }

      {
      profileData.education.length>0 &&  <div  className="w-full min-h-[100px] flex flex-col gap-[10px] justify-center p-[20px] 
        font-semibold bg-white shadow-lg rounded-lg ">
          <div className=" text-[22px] text-gray-600" >Education</div>
              <div className="flex flex-col justify-start items-start gap-[20px] p-[20px] text-gray-600">
            {profileData.education.map((edu)=>(
              <>
              <div className="text-[20px]">College : {edu.college}</div>
              <div className="text-[20px]">Degree :  {edu.degree}</div>
              <div className="text-[20px]">Field Of Study : {edu.fieldOfStudy}</div>   
              </>     
            ))}
            {profileData._id==userData._id &&  <button  className="min-w-[150px] h-[40px] rounded-full 
            border-2 border-[#2dc0ff] text-[#2dc0ff] flex items-center justify-center gap-[10px]"
             onClick={()=>setShow(true)}    >
                       Add education</button>}
             
            </div>
           </div>
     }
     
      {
      profileData.experience.length>0 &&  <div  className="w-full min-h-[100px] flex flex-col gap-[10px] justify-center p-[20px] 
        font-semibold bg-white shadow-lg rounded-lg ">
          <div className=" text-[22px] text-gray-600" >Experience</div>
              <div className="flex flex-col justify-start items-start gap-[20px] p-[20px] text-gray-600">
            {profileData.experience.map((ex)=>(
              <>
              <div className="text-[20px]">title : {ex.title}</div>
              <div className="text-[20px]">company :  {ex.company}</div>
              <div className="text-[20px]">description : {ex.description}</div>   
              </>     
            ))}
            {profileData._id==userData._id && <button  className="min-w-[150px] h-[40px] rounded-full border-2 border-[#2dc0ff]
                      text-[#2dc0ff] flex items-center justify-center gap-[10px]"
                         onClick={()=>setShow(true)}    >
                       Add experience</button>}
              
            </div>
           </div>
     }
   

      {profilePost.map((post,index)=>(
        <Post key={index} id={post._id} description={post.description} author={post.author}
                     like={post.like} comment={post.comment} image={post.image} createdAt={post.createdAt}   />

      ))
     }
     

     

      </div>
    </div>
  );
}

export default Profile;
