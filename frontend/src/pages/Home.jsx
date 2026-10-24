import React, { useContext, useEffect, useRef, useState } from "react";
import Nav from "../components/Nav.jsx";
import { FaCamera } from "react-icons/fa";
import dp from "../assets/dp.jpg";
import { MdAdd } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { BsImage } from "react-icons/bs";

import { userDataContext } from "../context/UserContext.jsx";
import { BiSolidPencil } from "react-icons/bi";
import EditProfile from "../components/EditProfile.jsx";
import { authDataContext } from "../context/AuthContext.jsx";
import axios from "axios";
import Post from "../components/Post.jsx";


function Home() {
  let { userData,show,setShow,postData,handleGetProfile } = useContext(userDataContext);
  let {serverUrl} =useContext(authDataContext)

  let [frontendImage,setFrontendImage]=useState("")
  let [backendImage,setBackendImage]=useState("")
  let [description,setDescription]=useState("")
   
  let [uploadPost,setUploadPost]=useState(false)

  let Image=useRef()
    let [posting,setPosting]=useState(false)
    let [suggestedUser,setSuggestedUser]=useState([])


  function handleImage(e){
    let file=e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }

  async function handleUploadPost(){
    setPosting(true)
    try {
      let formdata=new FormData()
      formdata.append("description",description)
      if(backendImage){
        formdata.append("image",backendImage)
      }
      let result=await axios.post(serverUrl+"/api/post/create",
        formdata,{withCredentials:true})
     console.log(result)
      setPosting(false)
      setUploadPost(false)

    } catch (error) {
      setPosting(false)
      console.log(error)
      
    }
   }

   const handleSuggestedUsers=async ()=>{
      try {
        let result =await axios.get(serverUrl+"/api/user/suggestedusers",{withCredentials:true})
        setSuggestedUser(result.data)
      } catch (error) {
        console.log(error)
      }
   }


useEffect(()=>{
  handleSuggestedUsers()
},[])



  return (
    <div
      className="w-full min-h-[100vh] bg-[#f4f2ee] pt-[100px]
     flex items-center lg:items-start justify-center gap-[20px] px-[20px] flex-col lg:flex-row pb-[50px] "
    >
      {show && <EditProfile />}
      <Nav />

      <div className=" w-full lg:w-[25%] min-h-[200px] bg-[white] shadow-lg rounded-lg p-[10px] relative ">
        <div
          className="w-[100%] h-[100px] bg-gray-400 rounded overflow-hidden flex
                      items-center justify-center cursor-pointer "
          onClick={() => setShow(true)}
        >
          <img src={userData.coverImage || " "} alt="" className="w-full " />
          <FaCamera className="absolute right-[20px] top-[20px] w-[25px] h-[25px] text-white cursor-pointer  " />
        </div>

        <div
          className="w-[70px] h-[70px] rounded-full flex overflow-hidden items-center justify-center
                     absolute top-[65px] left-[35px]"
          onClick={() => setShow(true)}
        >
          <img src={userData.profileImage || dp} alt="" className=" h-full  cursor-pointer" />
        </div>
        <div
          className="w-[20px] h-[20px] bg-[#17c1ff] absolute top-[105px] 
                  left-[90px] rounded-full flex justify-center items-center "
        >
          <MdAdd className="text-white" />
        </div>

        <div className="mt-[30px] pl-[20px] font-semibold text-gray-700">
          <div className=" text-[22px]" >{`${userData.firstName} ${userData.lastName}`}</div>
          <div className="text-[18px] font-semibold text-gray-600">
            {userData.headline || ""}
          </div>
          <div className="text-[16px]  text-gray-500">{userData.location}</div>
        </div>
        <button
          className="w-[100%] h-[40px] my-[20px] rounded-full border-2 border-[#2dc0ff]
                  text-[#2dc0ff] flex items-center justify-center gap-[10px]"
          onClick={() => setShow(true)}
        >
          Edit Profile
          <BiSolidPencil />{" "}
        </button>
      </div>
       
      
        {/* POPUP OF START A POST */}

        {uploadPost &&    <div className="w-full h-full bg-black  fixed top-0 z-[100] left-0 opacity-[0.6]" ></div>
               }
         
         {uploadPost && <div className="w-[90%] max-w-[500px] h-[600px] bg-white
                      fixed overflow-auto z-[200] top-[100px] shadow-lg rounded-lg p-[20px]
                      flex items-start justify-start flex-col  gap-[20px] ">
                 <div className="absolute top-[20px]
                  right-[20px] cursor-pointer">
                   <RxCross2 className="  w-[25px] h-[25px] cursor-pointer text-gray-800 
                   font-bold"  onClick={()=>setUploadPost(false)} /> 
                </div>
          <div className="flex justify-start items-center  gap-[10px]">
             <div
                className="w-[70px] h-[70px] rounded-full  overflow-hidden
                    cursor-pointer flex items-center justify-center " >
                  <img src={userData.profileImage || dp} alt="" className=" h-full  " />
            </div>
            <div className=" text-[22px]" >{`${userData.firstName} ${userData.lastName}`} 
            </div>
             </div>  
             <textarea className={`w-full ${frontendImage?"h-[200px]":"h-[550px]"} outline-none border-none p-[10px] resize-none text-[19px]`} 
             placeholder="what do you want to talk about...?"  value={description}
             onChange={(e)=>setDescription(e.target.value)}></textarea> 
                  <input type="file" ref={Image}  hidden onChange={handleImage} />
                <div className="w-full h-[300px] overflow-hidden flex justify-center items-center rounded-lg" >
                  <img src={frontendImage ||  " "} alt="" className="h-full rounded-lg " />
                </div>


            <div className="w-full h-[200px] flex-col">
              <div className="p-[20px] flex items-center justify-start border-b-2 border-gray-500" >
                   <BsImage className="w-[24px] h-[24px] text-gray-500 cursor-pointer "
                     onClick={()=>Image.current.click()}
                   />
              </div> 
              


              <div className="flex justify-end items-start"  >
                <button className="w-[100px] h-[50px] rounded-full bg-[#1a73e8] mt-[20px] 
                    text-white" disabled={posting} onClick={handleUploadPost} >
                      {posting?"Posting..." : "Post" }  
                      </button>
                
              </div>
            </div>

      </div> } 
     
     
     
        <div className="w-full lg:w-[50%] min-h-[200px] bg-[#f0efe7] flex flex-col gap-[20px] ">
            <div className="w-full h-[120px] bg-white shadow-lg rounded-lg
                 flex items-center justify-center p-[10px] gap-[10px]">
                  <div
            className="w-[70px] h-[70px] rounded-full flex overflow-hidden items-center
            justify-center ">
                    
            <img src={userData.profileImage || dp} alt="" className=" h-full  cursor-pointer" />
          </div>
            <button className="w-[80%] h-[60%] border-2 border-gray-500 
                rounded-full flex items-start justify-start p-[20px] hover:bg-gray-200 "
                 onClick={()=>setUploadPost(true)} >start a post</button>
            </div>
               {postData.map((post,index)=>(
                 
                 <Post key={index} id={post._id} description={post.description} author={post.author}
                     like={post.like} comment={post.comment} image={post.image} createdAt={post.createdAt}  />
               ))}

        </div>

        <div className="w-full lg:w-[25%] min-h-[200px] bg-[white] shadow-lg hidden lg:flex flex-col p-[20px]">
          <h1 className="text-[20px] text-gray-600 font-semibold">Suggestesd User</h1>
          {suggestedUser.length>0 && <div className="flex flex-col gap-[10px]">
            {suggestedUser.map((su)=>(
                 <div className="flex items-center gap-[10px] mt-[10px] cursor-pointer hover:bg-gray-200 p-[5px]
                rounded-lg   " onClick={()=>handleGetProfile(su.userName)}>
                   <div className='w-[40px] h-[40px] rounded-full overflow-hidden ' >
                           <img src={su.profileImage || dp} alt="" className='w-full h-full' />
                           </div>

                 <div>
                     <div className=' text-[19px] font-semibold
                           text-gray-700' >{`${su.firstName}  ${su.lastName} `}</div>
                   <div className=' text-[12px] font-semibold  text-gray-700' >{su.headline}</div>
               </div> 
                       
                 </div>
            ))

            }

          </div>
          }
           {suggestedUser.length==0 && <div>
             No Suggested User
          </div>

          }

        </div>

    </div>
  );
}

export default Home;





