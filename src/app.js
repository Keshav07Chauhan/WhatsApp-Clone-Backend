import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

const allowedOrigins = [
  "http://localhost:5173",          // dev
  "https://whatsapp-clone-ylzj.onrender.com" // prod, it will be updated after deployment
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser clients
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json({}))      //16kb
app.use(express.urlencoded({extended: true, limit: "800kb"}))   //16kb
app.use(express.static("public"))
app.use(cookieParser())


import contactRouter from "./routes/contact.route.js"
import messageRouter from "./routes/message.route.js"


app.use("/api/v1/contact",contactRouter)
app.use("/api/v1/message",messageRouter)



export {app}