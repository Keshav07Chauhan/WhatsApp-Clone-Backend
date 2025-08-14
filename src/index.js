// index.js
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { setupSocket } from "./socket/socketHandler.js";

dotenv.config({ path: './.env' });
const allowedOrigins = [
  "http://localhost:5173",
  "https://whatsapp-clone-ylzj.onrender.com"
];

// Create HTTP server using express app
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
    cors: {
        origin: allowedOrigins, // your frontend URL
        credentials: true
    }
});
setupSocket(io);

// Connect DB, then start server
connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.error("Err: App is not listening", error);
            throw error;
        });
        server.listen(process.env.PORT, () => {
            console.log(`Server is running at port: ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed: ", err);
        throw err;
    });
