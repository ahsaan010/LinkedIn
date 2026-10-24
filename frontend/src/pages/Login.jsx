import React from 'react'
import { useContext, useState } from "react";
import logo from "../assets/logo.svg";
import { useNavigate } from "react-router-dom";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import { userDataContext } from '../context/UserContext.jsx'
function Login() {
  let [show, setShow] = useState(false);
  let {serverUrl}=useContext(authDataContext)
  let { setUserData } = useContext(userDataContext)
  let navigate = useNavigate();
 
  let [email,setEmail]=useState("")
  let [password,setPassword]=useState("")
  let [loading,setLoading]=useState(false)
  let [err,setErr]=useState("")
   
  const handleSignIn=async (e)=>{
    e.preventDefault();
    setLoading(true)
        try {
            let result =await axios.post(serverUrl+"/api/auth/login",{
                email,                     
                password
            },{withCredentials:true})
            setUserData(result.data)
            navigate("/")
            setErr("")
            setLoading(false)
            setEmail("")
            setPassword("")
        } catch (error) {
            setErr(error.response.data.message)
            setLoading(false)
        }               

  }
  return (
    <div className="w-full h-screen bg-[white] flex flex-col items-center justify-start">
      <div className="p-[30px] lg:p-[35px] w-full h-[80px] flex items-center">
        <img src={logo} alt="Logo" className="w-[102px] h-[25.5px]" />
      </div>
      <form className="w-[90%] max-w-[400px] h-[600px] md:shadow-2xl flex flex-col  justify-center gap-[10px] 
          p-[15px] border-radius-[25px] " onSubmit={handleSignIn} >
        <h1 className="text-gray-800 text-[30px] font-semibold mb-[30px] ">
         Sign In
        </h1>
        

        <input
          type="email"
          placeholder="email"
          required
          className="w-[100%] h-[50px] border-2 border-gray-600 text-gray-800 text-[18px] px-[20px] py-[10px] rounded-md"
          value={email} onChange={(e)=>setEmail(e.target.value)}
        />

        <div className="w-[100%] h-[50px] border-2 border-gray-600 text-gray-800 text-[18px]  rounded-md relative ">
          <input
            type={show ? "text" : "password"}
            placeholder="password"
            required
            className="w-full h-full border-none  text-gray-800 text-[18px] px-[20px] py-[10px]  rounded-md "
            value={password} onChange={(e)=>setPassword(e.target.value)}
          />
          <span
            className="absolute right-[20px] top-[10px] text-[#1a73e8] cursor-pointer "
            onClick={() => setShow((prev) => !prev)}
          >
            {show ? "🙈" : "👁️"}
          </span>
        </div>
         {
          err && <p className="text-center text-red-500">
          *{err}
         </p>
         }
        <button className="w-[100%] h-[50px] rounded-full bg-[#1a73e8] mt-[20px] 
         text-white" disabled={loading} > {loading?"Loading....":"Sign In"} </button>
         
       
        <p
          className="text-center cursor-pointer "
          onClick={() => navigate("/signup")}
        >
          want to create a new account{" "}
          <span className="text-[#1a73e8]">Sign up</span>{" "}
        </p>
      </form>
    </div>
  );
}

export default Login
