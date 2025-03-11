import { Router } from "express";
import express from "express";
import { handleUserLogin, handleUserSignUp, users, deleteUser } from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.js"

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/', router)

router.post('/signUp',handleUserSignUp);
router.post('/handleUserLogin', handleUserLogin);
router.get('/users', users);
router.get('/deleteUser', deleteUser);

export default router