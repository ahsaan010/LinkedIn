import React, {  useContext, useEffect, useState } from 'react'
import logo2 from "../assets/logo2.png"
import { FaSearch } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { FiUsers } from "react-icons/fi";
import { IoNotifications } from "react-icons/io5";
import dp from '../assets/dp.jpg'
import { userDataContext } from '../context/UserContext.jsx';
import { authDataContext } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import axios from 'axios';




function Nav() {
    let [activeSearch,setActiveSearch]=useState(false)
    let {userData,setUserData,handleGetProfile} = useContext(userDataContext)
    let {serverUrl}=useContext(authDataContext)
    let [showPopup,setShowPopup]=useState(false)
    const navigate = useNavigate();
    let [searchInput,setSearchInput]=useState("")
    let [searchData,setSearchData]=useState([])

  const handleSignOut=async ()=>{
     try {
        let result=await axios.get(serverUrl+"/api/auth/logout",{withCredentials:true})
         setUserData(null) 
         navigate("/login")
        console.log(result);
      } catch (error) {
       console.log(error);
      
     }


  }  

  const handleSearch=async ()=>{
    try {
        let result=await axios.get(`${serverUrl}/api/user/search?query=${searchInput}`,{withCredentials:true})
   
        setSearchData(result.data)

    } catch (error) {
      console.log(error)
      setSearchData([])
    }
  }

  useEffect(()=>{
      handleSearch()
     
  },[searchInput])



  return (
    <div className='w-full h-[80px] bg-[white] fixed top-0 shadow-lg flex 
    justify-between md:justify-around items-center px-[10px] left-0 z-[80]' >
           <div className='flex items-center justify-center gap-[10px]' > 
              <div onClick={()=>{setActiveSearch(false)
                        navigate("/")}} >
               <img src={logo2} alt="" className='w-[50px]  '  />
             </div>
             
             {!activeSearch && <div><FaSearch className='w-[23px] h-[23px] text-gray-600 lg:hidden'
                  onClick={()=>setActiveSearch(true)}/></div>}
    
        {
          searchData.length>0 &&  <div className='absolute top-[90px] min-h-[100px] left-[0px] lg:left-[20px]
            shadow-lg w-[100%] lg:w-[700px] bg-white flex flex-col gap-[20px] p-[20px]'>
            {searchData.map((sea)=>(
                      <div className='flex gap-[20px] items-center border-b-2 border-b-gray-300 p-[10px]
                       hover:bg-gray-200 cursor-pointer rounded-lg' onClick={()=>handleGetProfile(sea.userName)}>
                          <div className='w-[70px] h-[70px] rounded-full overflow-hidden ' >
                           <img src={sea.profileImage || dp} alt="" className='w-full h-full' />
                         </div>
                         <div>
                           
                           <div className=' text-[19px] font-semibold
                                    text-gray-700' >{`${sea.firstName}  ${sea.lastName} `}</div>
                           <div className=' text-[15px] font-semibold  text-gray-700' >{sea.headline}</div>
                         </div>

                      </div>
            ))

            }
         </div>
        }


             <form className={`w-[190px]  lg:w-[350px] h-[40px] bg-[#f4f2ee] lg:flex items-center gap-[10px] px-[10px] py-[5px] rounded-md  ${!activeSearch?"hidden":"flex"}  `} >
               <div><FaSearch  className='w-[23px] h-[23px] text-gray-600' /></div>
               <input type="text" className='w-[80%]h-full bg-transparent outline-none border-0 '  
               placeholder='search users...' onChange={(e)=>setSearchInput(e.target.value)} value={searchInput}/>
             </form>
           </div>



        <div className='flex items-center justify-center gap-[20px]  ' >

                 {showPopup && 
                 <div className='w-[300px] min-h-[300px] bg-white shadow-lg  absolute top-[75px] 
                     right-[20px] lg:right-[200px] rounded-lg flex flex-col items-center p-[20px] gap-[20px] '>
                     <div className='w-[70px] h-[70px] rounded-full overflow-hidden  ' >
                           <img src={userData.profileImage || dp} alt="" className='w-full h-full' />
                     </div>
                     <div className=' text-[19px] font-semibold text-gray-700' >{`${userData.firstName}  ${userData.lastName} `}</div>
                    <button className='w-[100%] h-[40px] rounded-full border-2 border-[#2dc0ff]
                           text-[#2dc0ff] ' onClick={()=>handleGetProfile(userData.userName)} >View Profile</button>
                      <div className='w-full h-[1px] bg-gray-700'></div>
                          <div className='flex w-full items-center justify-start  text-gray-600 gap-[10px]'
                              onClick={()=>navigate("/network")} >
                             <FiUsers className='w-[23px] h-[23px] text-gray-600' />
                             <div>My Networks</div>
                          </div>
                     <button className='w-[100%] h-[40px] rounded-full border-2 border-[#d21a1a] text-[#d21a1a] ' onClick={handleSignOut} >Sign out</button>

                 </div>
                  }
                




                <div className='flex-col items-center justify-center hidden text-gray-600 lg:flex cursor-pointer' onClick={()=> navigate("/")}>
                    <AiFillHome className='w-[23px] h-[23px] text-gray-600'  />
                    <div >Home</div>
                    
                </div>
                <div className='flex-col items-center justify-center hidden text-gray-600 lg:flex cursor-pointer'
                       onClick={()=>navigate("/network")} >
                    <FiUsers className='w-[23px] h-[23px] text-gray-600' />
                    <div>My Networks</div>
                </div>
                <div className='flex flex-col items-center justify-center text-gray-600 cursor-pointer'
                      onClick={()=>navigate("/notification")} >
                    <IoNotifications className='w-[23px] h-[23px] text-gray-600' />
                    <div className='hidden md:block'>Notification</div>
                </div>
                <div className='w-[50px] h-[50px] rounded-full overflow-hidden cursor-pointer '
                  onClick={()=>setShowPopup(prev=>!prev)} >
                    <img src={userData.profileImage || dp} alt="" className='w-full h-full' />
                </div>
       </div>
    
    </div>
  )
}

export default Nav
