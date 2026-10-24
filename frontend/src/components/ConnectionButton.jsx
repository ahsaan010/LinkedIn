import React, { useState,useContext,useEffect } from 'react'
import { authDataContext } from '../context/AuthContext';
import { socket } from '../context/UserContext.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ConnectionButton({userId}) {
    let {serverUrl}=useContext(authDataContext)
    let [status,setStatus]=useState("")
     let navigate=useNavigate()
     
    const handleSendConnection=async ()=>{
        try{
            let result=await axios.post(`${serverUrl}/api/connection/send/${userId}`,
                {},{withCredentials:true})
            console.log(result)    
        } catch(error){
            console.log(error)    

        }
    }
    const handleRemoveConnection=async ()=>{
        try{
            let result=await axios.delete(`${serverUrl}/api/connection/remove/${userId}`,
           {withCredentials:true})
            console.log(result)    
        } catch(error){
            console.log(error)    

        }
    }
    useEffect(()=>{
        let active=true

        const handleStatusUpdate=({updatedUserId,newStatus})=>{
            if(updatedUserId===userId){
            setStatus(newStatus)
            }
        }
        socket.on("statusUpdate",handleStatusUpdate)

        axios.post(`${serverUrl}/api/connection/getStatus/${userId}`,
            {},{withCredentials:true})
            .then((result)=>{
                if(active){
                    setStatus(result.data.status)
                }
            })
            .catch((error)=>{
                if(active){
                    console.log(error)
                }
            })

       return ()=>{
        active=false
        socket.off("statusUpdate",handleStatusUpdate)
       }

    },[serverUrl,userId])

  const handleClick= async ()=>{ 
    if(status==="disconnect"){
        await handleRemoveConnection()
    }else if(status==="received"){
        navigate("/network")
    }else{
      await handleSendConnection()
    }
  }

  return (
    <button className='min-w-[100px] h-[40px] rounded-full border-2 border-[#2dc0ff]
     text-[#2dc0ff] ' onClick={handleClick} disabled={status === "pending"}>
      {status} </button>
  )
}

export default ConnectionButton
