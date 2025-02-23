import { Router } from "express";
import express from "express";
import { uploadExcelSurveyData, pushCSVData } from "../controller/excelOperations.controller.js";
//import { handleContactForm } from "../controller/contacts.controller.js";
//import { verifyJWT } from "../middleware/auth.js"
import {upload} from "../middleware/multer.middleware.js"

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/', router)


// upload excel file on server
router.route('/upload').post(upload.single('file'),uploadExcelSurveyData);

// push CSV data from server to mongodb storage
router.route('/pushCSVData').post(pushCSVData);

export default router