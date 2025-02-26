import { Router } from "express";
import express from "express";

import { handleContactForms, downloadIndustryWiseReports } from "../controller/admin.controller.js";

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/admin', router)

// Contact form data from frontend and send to mongodb storage
router.route('/contactForms').post(handleContactForms);
router.route('/downloadIndustryWiseReports').get(downloadIndustryWiseReports);

export default router;