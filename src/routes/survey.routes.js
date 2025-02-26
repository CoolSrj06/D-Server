import { Router } from "express";
import express from "express";

import { postSurvey, postSurveyForm, sendSurveyFormData, displaySurveys } from "../controller/survey.controller.js";

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/survey', router)

router.route('/postSurvey').post(postSurvey);
router.route('/sendSurveyFormData').post(sendSurveyFormData);
router.route('/displaySurveys').get(displaySurveys);

export default router;