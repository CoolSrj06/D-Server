import { Router } from "express";
import express from "express";

import { handleContactForms } from "../controller/admin.controller.js";

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/admin', router)

// Contact form data from frontend and send to mongodb storage
router.route('/contactForms').get(handleContactForms);

export default router;