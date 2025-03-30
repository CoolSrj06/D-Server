import { Router } from "express";
import express from "express";

import { postSurvey, postSurveyForm, sendSurveyFormData, displaySurveys, downloadSurveyData } from "../controller/survey.controller.js";
import { verifyJWT } from "../middleware/auth.js"

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/survey', router)

router.route('/postSurvey').post(verifyJWT,postSurvey);
router.route('/sendSurveyFormData').post(sendSurveyFormData);
router.route('/displaySurveys').get(verifyJWT,displaySurveys);
router.route('/postSurveyForm').post(postSurveyForm);
router.route('/downloadSurveyData').get(verifyJWT, downloadSurveyData);

export default router;