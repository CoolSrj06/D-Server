import { asyncHandler } from "../utils/asyncHandler.js";
import { ContactForm } from "../model/contactForm.model.js";
import { buyReportRequest } from "../model/buyReportForm.model.js";
import { customReportRequest } from "../model/customReportRequest.model.js";
import { freeSampleRequest } from "../model/freeSampleRequest.model.js";

const handleContactForm = asyncHandler(async (req, res) => {
    try {
        const { firstName, lastName, email, phone, jobTitle, companyName, subject, message } = req.body;
        if (!firstName ||!lastName ||!email ||!phone ||!jobTitle ||!companyName ||!subject ||!message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newContactForm = new ContactForm({
            firstName:  firstName,
            lastName : lastName,
            email : email,
            phone : phone,
            jobTitle : jobTitle,
            companyName : companyName,
            subject : subject,
            message : message
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
        const { name, email, phone, companyName, address, reportId } = req.body;
        if (!name ||!email ||!phone ||!companyName ||!address ||!reportId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newBuyReportForm = new buyReportRequest({
            name:  name,
            email : email,
            phone : phone,
            companyName : companyName,
            address : address,
            reportId : reportId
        });

        await newBuyReportForm.save();

        res.status(201).json({ message: "Form submitted successfully" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error submitting form", error: error.message });
    }
});

const handleCustomReportRequest = asyncHandler(async (req, res) => {
    try {
        const { name, email, phone, companyName, jobTitle, message, reportId } = req.body;
        if (!name ||!email ||!phone ||!companyName ||!jobTitle ||!message ||!reportId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newCustomReportRequest = new customReportRequest({
            name:  name,
            email : email,
            phone : phone,
            companyName : companyName,
            jobTitle : jobTitle,
            message : message,
            reportId : reportId
        });

        await newCustomReportRequest.save();

        res.status(201).json({ message: "Form submitted successfully" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error submitting form", error: error.message });
    }
});

const handleFreeSampleRequest = asyncHandler(async (req, res) => {
    try {
        const { name, email, phone, companyName, reportId } = req.body;
        if (!name ||!email ||!phone ||!companyName ||!reportId) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const newFreeSampleRequest = new freeSampleRequest({
            name:  name,
            email : email,
            phone : phone,
            companyName : companyName,
            reportId : reportId
        });
        
        await newFreeSampleRequest.save();
        
        res.status(201).json({ message: "Form submitted successfully" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error submitting form", error: error.message });
    }
});

export {
    handleContactForm,
    handleCustomReportRequest,
    handleFreeSampleRequest,
    handleBuyReportForm
}