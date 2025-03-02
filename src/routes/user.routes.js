import { Router } from "express";
import express from "express";
import { handleAdminLogin, handleUserSignUp, handleSalesLogin, users, deleteUser } from "../controller/user.controller.js";
//import { verifyJWT } from "../middleware/auth.js"

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/', router)

router.post('/signUp',handleUserSignUp);
router.post('/adminLogin', handleAdminLogin);
router.post('/salesLogin', handleSalesLogin);
router.get('/users', users);
router.get('/deleteUser', deleteUser);

export default router