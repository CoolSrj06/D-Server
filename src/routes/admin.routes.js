import { Router } from "express";
import express from "express";
import { verifyJWT } from "../middleware/auth.js"
import { handleContactForms, downloadIndustryWiseReports, assignFormsToSales, listSalesPerson, deleteReports } from "../controller/admin.controller.js";
import { deleteForms } from "../controller/contacts.controller.js";

const app = express();
const router = Router();

app.use(express.static('../'));
app.use('/admin', router)

router.route('/').post(verifyJWT , (req, res) => {
    res.status(200).json({ message: "Verified successfully",userRole: req.user?.userType || "No role found" })
});
router.route('/contactForms').post(verifyJWT, handleContactForms);
router.route('/downloadIndustryWiseReports').get(verifyJWT, downloadIndustryWiseReports);
router.route('/assignFormsToSales').post(assignFormsToSales);
router.route('/listSalesPerson').get(listSalesPerson);
router.route('/delteReports').post(deleteReports);
router.route('/deleteForms').post(verifyJWT, deleteForms);

export default router;