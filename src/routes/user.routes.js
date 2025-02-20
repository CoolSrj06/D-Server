import { Router } from "express";
import express from "express";
import { postSurvey , postSurveyForm , downloadSurveyData, paginatedCSVData,
    uploadExcelSurveyData, handleAdminLogin, handleUserSignUp, handleSalesLogin, pushCSVData } from "../controller/user.controller.js";
//import { verifyJWT } from "../middleware/auth.js"
import {upload} from "../middleware/multer.middleware.js"

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/', router)

router.route('/postSurvey').post(postSurvey);
router.route('/postSurveyForm').post(postSurveyForm);
router.route('/upload').post(upload.single('file'),uploadExcelSurveyData);
router.post('/signUp',handleUserSignUp);
router.post('/adminLogin', handleAdminLogin);
router.post('/salesLogin', handleSalesLogin);
router.route('/pushCSVData').post(pushCSVData);

router.route('/downloadSurveyData').get(downloadSurveyData);
router.route('/paginatedCSVData').get(paginatedCSVData);


export default router