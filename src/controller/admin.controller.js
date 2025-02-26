import {asyncHandler} from '../utils/asyncHandler.js';
import {ContactUsForm} from '../model/contactUsForm.model.js';
import {buyReportRequest} from '../model/buyReportForm.model.js';
import {customReportOrDemoReportRequest} from '../model/customReportOrDemoReportRequest.model.js';
import {CSVData} from '../model/CSV.model.js';
import xlsx from "xlsx";

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

        const totalDocuments = await form.length; // Count total documents

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

export {
    handleContactForms,
    downloadIndustryWiseReports
}