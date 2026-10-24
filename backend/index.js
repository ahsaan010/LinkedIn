import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import connectionRouter from "./routes/connection.routes.js";
import http from "http";
import { Server } from "socket.io";
import notificationRouter from "./routes/notification.routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    "https://linkedin-frontend-vbxq.onrender.com",
    "http://localhost:5173"
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

export const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

export const userSocketMap = new Map();

io.on("connection", (socket) => {
    console.log("user connected", socket.id);

    socket.on("register", (userId) => {
        userSocketMap.set(userId, socket.id);
    });

    socket.on("disconnect", (reason) => {
        console.log("user disconnected", reason);
    });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/connection", connectionRouter);
app.use("/api/notification", notificationRouter);

const port = process.env.PORT || 5000;

server.listen(port, () => {
    connectDb();
    console.log("server started");
});
