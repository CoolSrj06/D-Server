import { Router } from "express";
import express from "express";
import { handleContactUsForm, handleCustomReportOrDemoReportRequest, handleBuyReportForm  } from "../controller/contacts.controller.js";

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/', router)

router.route('/contactUs').post(handleContactUsForm);
router.route('/customReport').post(handleCustomReportOrDemoReportRequest);
router.route('/buyReport').post(handleBuyReportForm);

export default router;