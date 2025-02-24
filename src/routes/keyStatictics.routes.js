import { Router } from "express";
import express from "express";
import {  assignKeyStatictics, getKeyStatictics, updateKeyStatictics } from '../controller/keyStatictics.controller.js';

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/', router)

router.route('/assignKeyStatictics').post(assignKeyStatictics);
router.route('/getKeyStatictics').get(getKeyStatictics);
router.route('/updateKeyStatictics').post(updateKeyStatictics);

export default router;