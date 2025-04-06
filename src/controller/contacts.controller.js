import { asyncHandler } from "../utils/asyncHandler.js";
import { ContactUsForm } from "../model/contactUsForm.model.js";
import { buyReportRequest } from "../model/buyReportForm.model.js";
import { customReportOrDemoReportRequest } from "../model/customReportOrDemoReportRequest.model.js";

const handleContactUsForm = asyncHandler(async (req, res) => {
    try {
        const { firstName, lastName, email, phone, jobTitle, companyName, subject, message, formId } = req.body;
        if (!firstName ||!lastName ||!email ||!phone ||!jobTitle ||!companyName ||!subject ||!message || !formId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newContactForm = new ContactUsForm({
            firstName:  firstName,
            lastName : lastName,
            email : email,
            phone : phone,
            jobTitle : jobTitle,
            companyName : companyName,
            subject : subject,
            message : message,
            formId : formId
        });

        await newContactForm.save();

        res.status(201).json({ message: "Form submitted successfully" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error submitting form", error: error.message });
    }
});

const handleBuyReportForm = asyncHandler(async (req, res) => {
    try {
        const { firstName, lastName, email, phone, jobTitle ,companyName, subject, message, address, reportId, formId, status } = req.body;
        if (!firstName || !lastName ||!email ||!phone ||!companyName ||!address ||!reportId ||!formId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newBuyReportForm = new buyReportRequest({
            firstName:  firstName,
            lastName : lastName,
            email : email,
            phone : phone,
            jobTitle : jobTitle,
            companyName : companyName,
            subject : subject,
            message : message,
            address : address,
            reportId : reportId,
            formId : formId,
            status: status || 'pending', // Default to 'pending' if not provided
            assignedTo: null, // Default to null if not provided
        });

        await newBuyReportForm.save();

        res.status(201).json({ message: "Form submitted successfully" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error submitting form", error: error.message });
    }
});

const handleCustomReportOrDemoReportRequest = asyncHandler(async (req, res) => {
    try {
        const { firstName, lastName, email, phone, jobTitle, companyName, subject, message, reportId, formId } = req.body;
        if (!firstName ||!lastName ||!email ||!phone ||!companyName ||!subject ||!jobTitle ||!message ||!reportId || !formId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newCustomReportRequest = new customReportOrDemoReportRequest({
            firstName:  firstName,
            lastName : lastName,
            email : email,
            phone : phone,
            companyName : companyName,
            subject : subject,
            jobTitle : jobTitle,
            message : message,
            reportId : reportId,
            formId : formId
        });

        await newCustomReportRequest.save();

        res.status(201).json({ message: "Form submitted successfully" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error submitting form", error: error.message });
    }
});

const deleteForms = asyncHandler(async (req, res) => {
    try {
        // recieive formId from the request body and object _id and remove from the database, also retrieve userType from the jwt token
        const { formId, _id } = req.body;
        if (!formId ||!_id) {
            return res.status(400).json({ message: "Invalid request: Form ID and object ID are required" });
        }
        const userType = req.user.userType;
        if (userType !== 'admin') {
            return res.status(403).json({ message: "Access denied" });
        }
        let form;
        switch (formId) {
            case 'ContactForm123':
                form = await ContactUsForm.findOneAndDelete({ _id });
                break;
            case 'BuyForm123':
                form = await buyReportRequest.findOneAndDelete({ _id });
                break;
            case 'CustomReportForm123':
                form = await customReportOrDemoReportRequest.findOneAndDelete({ _id });
                break;
            default:
                return res.status(400).json({ message: "Invalid form ID" });
        }
        if (!form) {
            return res.status(404).json({ message: "Form not found" });
        }
        res.status(200).json({ message: "Form deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting form", error: error.message });
    }
});

export {
    handleContactUsForm,
    handleCustomReportOrDemoReportRequest,
    handleBuyReportForm,
    deleteForms
}