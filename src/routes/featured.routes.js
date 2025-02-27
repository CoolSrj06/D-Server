import { Router } from "express";
import express from "express";

import { setFeatured, featuredReports, fullDetailOfFeaturedReports } from "../controller/featured.controller.js";
import { verifyJWT } from "../middleware/auth.js"

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/featured', router)

router.route('/setFeatured').post(verifyJWT, setFeatured);
router.route('/featuredReports').get(featuredReports);
router.route('/fullDetailOfFeaturedReports').get(fullDetailOfFeaturedReports);

export default router;