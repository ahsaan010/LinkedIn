import express from "express"
import { signUp, login, logOut } from "../controllers/auth.controllers.js"

let authRouter=express.Router()

authRouter.post("/signup",signUp)
authRouter.post("/login",login)
authRouter.get("/logout",logOut)

export default authRouter