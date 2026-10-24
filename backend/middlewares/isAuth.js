import jwt from "jsonwebtoken"
import { logServerError } from "../config/logging.js"

const isAuth=async (req,res,next)=>{
    const { token } = req.cookies || {}
    if (!token) {
        return res.status(401).json({ message: "Please sign in to continue" })
    }

    if (!process.env.JWT_SECRET) {
        const error = new Error("JWT_SECRET is required")
        logServerError("auth.jwt_secret_missing", error, req.requestId)
        return res.status(500).json({
            message: "Authentication is temporarily unavailable",
            requestId: req.requestId
        })
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        if (typeof payload === "string" || !payload.userId) {
            return res.status(401).json({ message: "Please sign in to continue" })
        }
        req.userId = payload.userId
        return next()
    } catch (error) {
        if (
            error instanceof jwt.TokenExpiredError
            || error instanceof jwt.JsonWebTokenError
            || error instanceof jwt.NotBeforeError
        ) {
            return res.status(401).json({ message: "Your session is invalid or expired" })
        }

        logServerError("auth.token_verification_failed", error, req.requestId)
        return res.status(500).json({
            message: "Authentication is temporarily unavailable",
            requestId: req.requestId
        })
    }
}
export default isAuth