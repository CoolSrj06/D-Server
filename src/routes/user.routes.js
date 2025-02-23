import { Router } from "express";
import express from "express";
import { postSurvey , postSurveyForm , downloadSurveyData, paginatedCSVData, handleReport,
     handleAdminLogin, handleUserSignUp, handleSalesLogin } from "../controller/user.controller.js";
//import { verifyJWT } from "../middleware/auth.js"
import {upload} from "../middleware/multer.middleware.js"

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/', router)

// push 
router.route('/postSurvey').post(postSurvey);
router.route('/postSurveyForm').post(postSurveyForm);

// User Signup
router.post('/signUp',handleUserSignUp);

// Admin and Sales Login
router.post('/adminLogin', handleAdminLogin);
router.post('/salesLogin', handleSalesLogin);

// download survey data from mongodb storage
router.route('/downloadSurveyData').get(downloadSurveyData);

// paginated CSV data from mongodb storage to frontend
router.route('/paginatedCSVData').get(paginatedCSVData);

// fetch report data from mongodb storage and send to frontend
router.route('/handleReport').get(handleReport);

export default router