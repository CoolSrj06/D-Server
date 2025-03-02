import { Router } from "express";
import express from "express";
import { verifyJWT } from "../middleware/auth.js"
import { handleContactForms, tasksAssignedToMe  } from "../controller/sales.controller.js";

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/sales', router)

router.route('/handleContactForms').get(handleContactForms);
router.route('/tasksAssignedToMe').get(tasksAssignedToMe);

export default router;