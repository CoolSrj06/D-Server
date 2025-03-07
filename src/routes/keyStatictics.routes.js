import { Router } from "express";
import express from "express";
import {  getKeyStatictics, upsertKeyStatistics } from '../controller/keyStatictics.controller.js';
import { verifyJWT, validateApiKey } from "../middleware/auth.js"

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/', router)
router.route('/getKeyStatictics').get(validateApiKey,getKeyStatictics);
router.route('/upsertKeyStatistics').post(verifyJWT, upsertKeyStatistics);

export default router;