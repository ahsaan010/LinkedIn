import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from 'bcryptjs'
import { logServerError } from "../config/logging.js"

const cookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    secure: process.env.NODE_ENV === "production"
}

const publicUser = (user) => {
    const result = user.toObject()
    delete result.password
    return result
}

const isDuplicateKeyError = (error) => error?.code === 11000

export const signUp=async (req,res)=>{
    try {
        const { firstName, lastName, userName, email, password } = req.body || {}
        if (
            [firstName, lastName, userName, email].some(
                (value) => typeof value !== "string" || !value.trim()
            )
            || typeof password !== "string"
        ) {
            return res.status(400).json({ message: "All fields are required" })
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({ message: "Enter a valid email address" })
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" })
        }

        const normalizedEmail = email.trim().toLowerCase()
        const normalizedUserName = userName.trim()
        const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { userName: normalizedUserName }]
        })
        if (existingUser) {
            const field = existingUser.email === normalizedEmail ? "email" : "username"
            return res.status(409).json({ message: `An account with this ${field} already exists` })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            userName: normalizedUserName,
            email: normalizedEmail,
            password: hashedPassword
        })
        const token = genToken(user._id)
        res.cookie("token", token, cookieOptions)
        return res.status(201).json(publicUser(user))
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            return res.status(409).json({ message: "An account with this email or username already exists" })
        }
        logServerError("auth.signup_failed", error, req.requestId)
        return res.status(500).json({
            message: "Unable to create account",
            requestId: req.requestId
        })
    }
}

export const login=async (req,res)=>{
    try {
        const { email, password } = req.body || {}
        if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }
        const user = await User.findOne({ email: email.trim().toLowerCase() })
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        const token = genToken(user._id)
        res.cookie("token", token, cookieOptions)
        return res.status(200).json(publicUser(user))
    } catch (error) {
        logServerError("auth.login_failed", error, req.requestId)
        return res.status(500).json({
            message: "Unable to sign in",
            requestId: req.requestId
        })
    }
} 

export const logOut=async (req,res)=>{
    try {
        const { maxAge: _maxAge, ...clearCookieOptions } = cookieOptions
        res.clearCookie("token", clearCookieOptions)
        return res.status(200).json({message:"log out successfully"})
    } catch (error) {
        logServerError("auth.logout_failed", error, req.requestId)
        return res.status(500).json({
            message: "Unable to sign out",
            requestId: req.requestId
        })
    }
}
