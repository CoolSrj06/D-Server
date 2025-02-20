import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from 'dotenv';

dotenv.config(); 
const app = express()

// app.use() is a function in Express.js that allows you to add middleware to your application
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public")) 
app.use(cookieParser())


//routes import
import userRoute from './routes/user.routes.js';
//import { errorHandler } from './middleware/errorHandler.js';


//routes declaration
app.use("/", userRoute)

// Error handling middleware (must be after all routes)
//app.use(errorHandler);

export { app }