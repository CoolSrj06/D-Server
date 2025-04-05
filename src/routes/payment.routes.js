import { Router } from "express";
import express from "express";
import { createOrder } from "../controller/payment.controller.js";

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/api', router)

router.route('/createOrder').post(createOrder);
