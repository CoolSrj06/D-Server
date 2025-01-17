import { Router } from "express";
import express from "express";
import { postSurvey , postSurveyForm , downloadSurveyData } from "../controller/user.controller.js";
//import { verifyJWT } from "../middleware/auth.js"
//import {upload} from "../middleware/multer.middleware.js"

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/', router)

router.route('/postSurvey').post(postSurvey);
router.route('/postSurveyForm').post(postSurveyForm);

router.route('/downloadSurveyData').get(downloadSurveyData);

export default router