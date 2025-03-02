import { Router } from "express";
import express from "express";
import { uploadExcelSurveyData, pushCSVData, paginatedCSVData } from "../controller/excelOperations.controller.js";
//import { handleContactForm } from "../controller/contacts.controller.js";
//import { verifyJWT } from "../middleware/auth.js"
import {upload} from "../middleware/multer.middleware.js"

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/', router)

router.route('/upload').post(upload.single('file'),uploadExcelSurveyData);
router.route('/pushCSVData').post(pushCSVData);
router.route('/paginatedCSVData').get(paginatedCSVData);

export default router