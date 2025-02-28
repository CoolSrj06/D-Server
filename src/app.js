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
import contactRoute from './routes/contacts.routes.js';
import excelOperationRoute from './routes/excelOperations.routes.js';
import keyStatictics from "./routes/keyStatictics.routes.js";
import admin from "./routes/admin.routes.js";
import survey from "./routes/survey.routes.js";
import featured from "./routes/featured.routes.js";
import { errorHandler } from './middleware/errorHandler.js';


//routes declaration
app.use("/", userRoute)
app.use("/", contactRoute)
app.use("/", excelOperationRoute)
app.use("/", keyStatictics)
app.use("/admin", admin)
app.use("/survey", survey)
app.use("/featured", featured)

// Error handling middleware (must be after all routes)
app.use(errorHandler);

export { app }