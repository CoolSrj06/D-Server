import { Router } from "express";
import express from "express";
import { handleReport, handleAdminLogin, handleUserSignUp, handleSalesLogin } from "../controller/user.controller.js";
//import { verifyJWT } from "../middleware/auth.js"

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/', router)

router.post('/signUp',handleUserSignUp);

router.post('/adminLogin', handleAdminLogin);
router.post('/salesLogin', handleSalesLogin);

// fetch report data from mongodb storage and send to frontend
router.route('/handleReport').get(handleReport);

export default router