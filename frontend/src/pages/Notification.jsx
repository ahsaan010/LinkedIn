import React from "react";
import Nav from "../components/Nav";
import { useContext } from "react";
import { authDataContext } from "../context/AuthContext.jsx";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import dp from "../assets/dp.jpg";
import { RxCross2 } from "react-icons/rx";


function Notification() {
  let { serverUrl } = useContext(authDataContext);
  let [notificationData, setNotificationData] = useState([]);

  const handleGetNotification = async () => {
    try {
      let result = await axios.get(serverUrl + "/api/notification/get", {
        withCredentials: true,
      });
      setNotificationData(result.data);
    } catch (error) {
      console.log(error);
    }
  };
  const handledeleteNotification =async (id)=>{
    try {
      let result =await axios.delete(serverUrl+`/api/notification/deleteone/${id}`, {
        withCredentials: true })

        await handleGetNotification()
   
    } catch (error) {
     console.log(
      "Delete notification error:",
      error.response?.data || error.message
    );
    }
  };
  const handleClearAllNotification=async ()=>{
    try {
      let result =await axios.delete(serverUrl+"/api/notification", {
        withCredentials: true })
        await handleGetNotification()
   
    } catch (error) {
      console.log(error);
    }
  };

  function handleMessage(type) {
    if (type == "like") {
      return "liked your post";
    } else if (type == "comment") {
      return "commented your post";
    } else {
      return "Accept your connection";
    }
  }

  useEffect(() => {
    handleGetNotification()

  }, []);

  return (
    <div className="min-h-screen w-full bg-[#f0efe7] pt-[100px] pb-6 px-3 sm:px-5 flex flex-col items-center gap-[10px]">
        <Nav/>
         <div className="w-full max-w-[900px] min-h-[80px] bg-white shadow-lg rounded-lg flex
             items-center p-3 sm:p-5 text-lg sm:text-[22px] text-gray-600 justify-between gap-3" >
                <div className="min-w-0">
                Notifications {notificationData.length} 
                </div>
                {notificationData.length>0 &&
                 <button className='shrink-0 rounded-full border-2 px-4 py-2 hover:bg-[#f1eded] flex items-center border-[#d21a1a] text-[#d21a1a] text-sm sm:text-base
                ' onClick={handleClearAllNotification}>Clear All</button>}
                   </div>
          {notificationData.length>0 &&  <div className='w-full max-w-[900px] shadow-lg bg-white
               rounded-lg flex flex-col overflow-y-auto p-2 sm:p-5'>
                 {notificationData.map((noti)=>(
                   <div className='w-full min-w-0 min-h-[100px] p-3 sm:p-5 flex justify-between items-start gap-3 border-b-2
                       border-b-gray-200'  key={noti._id}>
                    <div className="min-w-0 flex-1">
                       <div className='flex items-center gap-3' >
                          <div className='w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] rounded-full overflow-hidden shrink-0'>
                               <img src={noti.relatedUser.profileImage || dp} alt="" className='w-full h-full object-cover' />
                            </div>
                            <div className='min-w-0'> <div className='text-[15px] sm:text-[19px] font-semibold text-gray-700 break-words'>
                                          {`${noti.relatedUser.firstName}  ${noti.relatedUser.lastName} 
                                          ${handleMessage(noti.type)} `}</div>
                             </div>
                        </div>
                            {noti.relatedPost &&
                                <div className="flex items-start gap-3 mt-2 ml-[56px] sm:ml-[62px]">
                                  <div className="w-16 h-12 sm:w-20 sm:h-[50px] overflow-hidden shrink-0">
                                     <img src={noti.relatedPost.image} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0 text-sm sm:text-base text-gray-700 break-words">{noti.relatedPost.description}</div>
                             </div>
                            }
                        </div>
                       <button type="button" className='shrink-0 p-1 text-gray-800 hover:bg-gray-100 rounded-full'
                         onClick={()=>handledeleteNotification(noti._id)} aria-label="Delete notification">
                           <RxCross2 className="w-[22px] h-[22px] cursor-pointer font-bold" />
                       </button>
                   </div>
                 ))}
              </div> }


    </div>
  );
}

export default Notification;
