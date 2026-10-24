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
import { randomUUID } from "node:crypto"
import { logServerError } from "./config/logging.js"

const app = express()
const server = http.createServer(app)
const configuredOrigins = (process.env.FRONTEND_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
const allowedOrigins = new Set([
    ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173"]),
    ...configuredOrigins,
    ...[
        process.env.VERCEL_URL,
        process.env.VERCEL_BRANCH_URL,
        process.env.VERCEL_PROJECT_PRODUCTION_URL
    ].filter(Boolean).map((url) => `https://${url}`)
])
const isAllowedOrigin = (origin, host, protocol) => (
    !origin
    || allowedOrigins.has(origin)
    || (host && origin === `${protocol}://${host}`)
)
const corsOptions = (req, callback) => {
    const origin = req.get("Origin")
    const protocol = req.get("x-forwarded-proto")?.split(",")[0] || req.protocol

    if (isAllowedOrigin(origin, req.get("host"), protocol)) {
        callback(null, { origin: true, credentials: true })
        return
    }
    callback(new Error("Origin is not allowed by CORS"))
}

const socketCorsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            callback(null, true)
            return
        }
        callback(new Error("Origin is not allowed by CORS"))
    },
    credentials: true
}

export const io = new Server(server, { cors: socketCorsOptions })

let redisClients
let redisAdapterReady = false
const getRealtimeStatus = () => {
    if (redisAdapterReady) return "redis-adapter-ready"
    return redisClients ? "redis-connecting-or-unavailable" : "single-instance"
}

const attachRedisAdapter = () => {
    if (
        !redisAdapterReady
        && redisClients?.every((client) => client.isReady)
    ) {
        io.adapter(createAdapter(...redisClients))
        redisAdapterReady = true
        console.info(JSON.stringify({ event: "socket.redis_adapter.ready" }))
    }
}

if (process.env.REDIS_URL) {
    try {
        const pubClient = createClient({ url: process.env.REDIS_URL })
        const subClient = pubClient.duplicate()
        redisClients = [pubClient, subClient]

        for (const client of redisClients) {
            client.on("error", (error) => {
                logServerError("socket.redis_connection_error", error)
            })
            client.on("ready", attachRedisAdapter)
            client.connect().catch((error) => {
                logServerError("socket.redis_connection_failed", error)
            })
        }
    } catch (error) {
        redisClients = undefined
        logServerError("socket.redis_configuration_failed", error)
    }
} else {
    console.warn(JSON.stringify({
        event: "socket.redis_not_configured",
        message: "Cross-instance Socket.IO events are unavailable until REDIS_URL is configured"
    }))
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

app.use((req, res, next) => {
    req.requestId = randomUUID()
    res.setHeader("X-Request-Id", req.requestId)
    next()
})

app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))

app.get("/api/health", async (req, res) => {
    try {
        await connectDb()
        res.status(200).json({
            status: "ok",
            database: "connected",
            realtime: getRealtimeStatus()
        })
    } catch (error) {
        logServerError("health.database_connection_failed", error, req.requestId)
        res.status(503).json({
            status: "unavailable",
            database: "unavailable",
            realtime: getRealtimeStatus()
        })
    }
})

app.use("/api", async (_req, _res, next) => {
    try {
        await connectDb()
        next()
    } catch (error) {
        logServerError("database.request_connection_failed", error, _req.requestId)
        _res.status(503).json({
            message: "Database temporarily unavailable",
            requestId: _req.requestId
        })
    }
})

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/post", postRouter)
app.use("/api/connection", connectionRouter)
app.use("/api/notification", notificationRouter)

app.use((error, _req, res, _next) => {
    if (error.message === "Origin is not allowed by CORS") {
        res.status(403).json({ message: "Origin is not allowed" })
        return
    }

    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        res.status(400).json({ message: "Request body must contain valid JSON" })
        return
    }

    if (error.status === 413) {
        res.status(413).json({ message: "Request body is too large" })
        return
    }

    logServerError("request.unhandled_error", error, _req.requestId)
    res.status(500).json({
        message: "Internal server error",
        requestId: _req.requestId
    })
})

export { app, server }
export default server

if (process.env.VERCEL !== "1") {
    const port = process.env.PORT || 8000
    server.listen(port, () => {
        console.log(`Server listening on port ${port}`)
    })
}
