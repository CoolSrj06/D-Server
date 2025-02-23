import { Router } from "express";
import express from "express";
import { postSurvey , postSurveyForm , downloadSurveyData, paginatedCSVData, handleReport,
    uploadExcelSurveyData, handleAdminLogin, handleUserSignUp, handleSalesLogin, pushCSVData } from "../controller/user.controller.js";
//import { handleContactForm } from "../controller/contacts.controller.js";
//import { verifyJWT } from "../middleware/auth.js"
import {upload} from "../middleware/multer.middleware.js"

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/', router)

// push 
router.route('/postSurvey').post(postSurvey);
router.route('/postSurveyForm').post(postSurveyForm);

// upload excel file on server
router.route('/upload').post(upload.single('file'),uploadExcelSurveyData);

// User Signup
router.post('/signUp',handleUserSignUp);

// Admin and Sales Login
router.post('/adminLogin', handleAdminLogin);
router.post('/salesLogin', handleSalesLogin);

// push CSV data from server to mongodb storage
router.route('/pushCSVData').post(pushCSVData);

// download survey data from mongodb storage
router.route('/downloadSurveyData').get(downloadSurveyData);

// paginated CSV data from mongodb storage to frontend
router.route('/paginatedCSVData').get(paginatedCSVData);

// fetch report data from mongodb storage and send to frontend
router.route('/handleReport').get(handleReport);

export default router