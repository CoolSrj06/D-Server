import {asyncHandler} from '../utils/asyncHandler.js';
import {ContactUsForm} from '../model/contactUsForm.model.js';
import {buyReportRequest} from '../model/buyReportForm.model.js';
import {customReportOrDemoReportRequest} from '../model/customReportOrDemoReportRequest.model.js';
import {CSVData} from '../model/CSV.model.js';
import xlsx from "xlsx";
import { User } from "../model/admin.model.js";

const handleContactForms = asyncHandler(async (req, res) => {
    try {
        const { formId } = req.body;
        const page = parseInt(req.query.page) || 1; // Get page number from query parameters
        const limit = parseInt(req.query.limit) || 10; // Get limit from query parameters

        const startIndex = (page - 1) * limit; // Calculate start index
        
        if (!formId) {
            return res.status(400).json({ message: 'Form ID is missing' });
        }

        let form;
        switch (formId) {
            case 'ContactForm123':
                form = await ContactUsForm.find().sort({ createdAt: -1 }).limit(limit).skip(startIndex);
                break;
            case 'BuyForm123':
                form = await buyReportRequest.find().sort({ createdAt: -1 }).limit(limit).skip(startIndex);
                break;
            case 'CustomizeForm123':
                form = await customReportOrDemoReportRequest.find({ formId: 'CustomizeForm123' }).sort({ createdAt: -1 }).limit(limit).skip(startIndex);
                break;
            case 'DemoForm123':
                form = await customReportOrDemoReportRequest.find({ formId: 'DemoForm123' }).sort({ createdAt: -1 }).limit(limit).skip(startIndex);
                break;
            default:
                return res.status(400).json({ message: 'Invalid form ID' });
        }

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        const totalDocuments = form.length; // Count total documents

        res.status(200).json({ 
            page,
            limit,
            totalDocuments,
            totalPages: Math.ceil(totalDocuments / limit),  // Calculate total pages based on total documents and limit
            form,
         });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching form' });
    }
})

const downloadIndustryWiseReports = asyncHandler(async (req, res) => {
    try {
        const industryID = req.query.industryID;
        const reports = await CSVData.find({ "Industries ID" : industryID });

        if (!reports || reports.length === 0) {
            return res.status(404).json({ message: 'No reports found for the given industry' });
        }

        // Convert data to JSON format for XLSX
        const data = reports.map(report => ({
            "SrNo": report["SrNo"],
            "Date": report["Date"],
            "Industries ID": report["Industries ID"],
            "Report Title": report["Report Title"],
            "Report ID": report["Report ID"],
            "Historical Range": report["Historical Range"],
            "Base Year": report["Base Year"],
            "Forecast Period": report["Forecast Period"],
            "Industry": report["Industry"],
            "Market Size - 2025 (USD Billion)": report["Market Size - 2025 (USD Billion)"],
            "Market Size - 2032 (USD Billion)": report["Market Size - 2032 (USD Billion)"],
            "CAGR (%)": report["CAGR (%)"],
            "Market Overview": report["Market Overview"],
            "Market Dynamics - Market Drivers": report["Market Dynamics - Market Drivers"],
            "Market Dynamics - Market Restrain": report["Market Dynamics - Market Restrain"],
            "Market Dynamics - Market Opp": report["Market Dynamics - Market Opp"],
            "Market Dynamics - Market Challenges": report["Market Dynamics - Market Challenges"],
            "Market Segmentation": report["Market Segmentation"],
            "Regional Analysis": report["Regional Analysis"],
            "Competitive Landscape": report["Competitive Landscape"],
            "Market Key Segments": report["Market Key Segments"],
            "Key Global Market Players": report["Key Global Market Players"]
        }));
    
        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Industry Reports");

        // Step 4: Write the workbook to a buffer
        const excelBuffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
        
        // Step 5: Send the Excel file as a response
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=survey-data.xlsx");
        res.send(excelBuffer);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching reports' });
    }
});

const assignFormsToSales =  asyncHandler(async (req, res) => {
    try {
        const { formId, _id,  salesPersonId } = req.body;
        if (!formId || !salesPersonId || !_id) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        let form;
        switch (formId) {
            case 'ContactForm123':
                form = await ContactUsForm.findOneAndUpdate({ _id }, { $set: { assignedTo: salesPersonId } }, { new: true });
                break;
            case 'BuyForm123':
                form = await buyReportRequest.findOneAndUpdate({ _id }, { $set: { assignedTo: salesPersonId } }, { new: true });
                break;
            case 'CustomizeForm123':
                form = await customReportOrDemoReportRequest.findOneAndUpdate({ _id }, { $set: { assignedTo: salesPersonId } }, { new: true });
                break;
            case 'DemoForm123':
                form = await customReportOrDemoReportRequest.findOneAndUpdate({ _id }, { $set: { assignedTo: salesPersonId } }, { new: true });
                break;
            default:
                return res.status(400).json({ message: 'Invalid form ID' });
        }
        
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }
        
        res.status(200).json({ message: 'Form assigned successfully'});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error assigning form' });
    }
});
    
const listSalesPerson = asyncHandler(async (req, res) => {
    try {
        const salesPersons = await User.find({ userType: 'sales' }).select(' fullName _id');
        res.json({ data: salesPersons });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching sales persons' });
    }
});

const deleteReports = asyncHandler(async (req, res) => {
    const userType = req.user.userType;
    console.log(userType)
    try {
        const { ids } = req.body; // Expecting an array of IDs and userType from frontend

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Invalid request: No IDs provided" });
        }

        if (userType !== 'admin') {
            return res.status(403).json({ message: "Unauthorized: Only admin can delete records" });
        }

        const result = await CSVData.deleteMany({ "Report ID": { $in: ids } });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No records found to delete" });
        }

        return res.status(200).json({
            message: `${result.deletedCount} record(s) deleted successfully`,
        });
    } catch (error) {
        console.error("Error deleting records:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export {
    handleContactForms,
    downloadIndustryWiseReports,
    assignFormsToSales,
    listSalesPerson,
    deleteReports
}