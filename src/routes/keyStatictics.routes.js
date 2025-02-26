import { Router } from "express";
import express from "express";
import {  getKeyStatictics, upsertKeyStatistics } from '../controller/keyStatictics.controller.js';

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/', router)
router.route('/getKeyStatictics').get(getKeyStatictics);
router.route('/upsertKeyStatistics').post(upsertKeyStatistics);

export default router;