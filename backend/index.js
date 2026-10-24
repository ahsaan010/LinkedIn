import "dotenv/config"
import express from "express"
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import postRouter from "./routes/post.routes.js"
import connectionRouter from "./routes/connection.routes.js"
import http from "http"
import jwt from "jsonwebtoken"
import { Server } from "socket.io"
import { createAdapter } from "@socket.io/redis-adapter"
import { createClient } from "redis"
import notificationRouter from "./routes/notification.routes.js"

const app = express()
const server = http.createServer(app)
const configuredOrigins = (process.env.FRONTEND_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
const allowedOrigins = new Set([
    ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173"]),
    ...configuredOrigins,
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [])
])
const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            callback(null, true)
            return
        }
        callback(new Error("Origin is not allowed by CORS"))
    },
    credentials: true
}

export const io = new Server(server, { cors: corsOptions })

if (process.env.REDIS_URL) {
    const pubClient = createClient({ url: process.env.REDIS_URL })
    const subClient = pubClient.duplicate()

    for (const client of [pubClient, subClient]) {
        client.on("error", (error) => {
            console.error("Redis connection error:", error.message)
        })
    }

    await Promise.all([pubClient.connect(), subClient.connect()])
    io.adapter(createAdapter(pubClient, subClient))
} else if (process.env.VERCEL === "1") {
    throw new Error("REDIS_URL is required on Vercel for cross-instance Socket.IO")
}

io.use((socket, next) => {
    try {
        const tokenCookie = socket.handshake.headers.cookie
            ?.split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith("token="))
        const token = tokenCookie && decodeURIComponent(tokenCookie.slice("token=".length))

        if (!token || !process.env.JWT_SECRET) {
            next(new Error("Unauthorized"))
            return
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET)
        if (typeof payload === "string" || !payload.userId) {
            next(new Error("Unauthorized"))
            return
        }

        socket.data.userId = String(payload.userId)
        next()
    } catch {
        next(new Error("Unauthorized"))
    }
})

io.on("connection", (socket) => {
    socket.join(socket.data.userId)
})

app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))

app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok" })
})

app.use("/api", async (_req, _res, next) => {
    try {
        await connectDb()
        next()
    } catch (error) {
        console.error("MongoDB connection failed:", error.message)
        _res.status(503).json({ message: "Database temporarily unavailable" })
    }
})

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/post", postRouter)
app.use("/api/connection", connectionRouter)
app.use("/api/notification", notificationRouter)

app.use((error, _req, res, _next) => {
    console.error("Unhandled API error:", error)
    res.status(500).json({ message: "Internal server error" })
})

export { app, server }
export default server

if (process.env.VERCEL !== "1") {
    const port = process.env.PORT || 8000
    server.listen(port, () => {
        console.log(`Server listening on port ${port}`)
    })
}
