import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({}))      //16kb
app.use(express.urlencoded({extended: true, limit: "800kb"}))   //16kb
app.use(express.static("public"))
app.use(cookieParser())


import contactRouter from "./routes/contact.route.js"
import messageRouter from "./routes/message.route.js"


app.use("/api/v1/contact",contactRouter)
app.use("/api/v1/message",messageRouter)



export {app}