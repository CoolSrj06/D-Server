import { Router } from "express";
import express from "express";
import { postSurvey,postSurveyForm } from "../controller/user.controller.js";
//import { verifyJWT } from "../middleware/auth.js"
//import {upload} from "../middleware/multer.middleware.js"

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/', router)

router.route('/postSurvey').post(postSurvey);
router.route('/postSurveyForm').post(postSurveyForm);

export default router