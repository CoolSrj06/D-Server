import { asyncHandler } from "../utils/asyncHandler.js";
import xlsx from "xlsx";
import fs from "fs";
import { CSVData } from "../model/CSV.model.js";

let jsonData = null;
const uploadExcelSurveyData = asyncHandler(async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Read the uploaded Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0]; // Get first sheet
        const sheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON with raw=false to handle dates properly
        const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false });

        if (rawData.length < 2) {
            return res.status(400).json({ message: "Invalid file format: Missing headers or data" });
        }

        const finalHeaders = [
            "SrNo", "Date", "Industries ID", "Report Title", "Report ID", "Historical Range",
            "Base Year", "Forecast Period", "Industry", "Market Size - 2025 (USD Billion)", "Market Size - 2032 (USD Billion)", "CAGR (%)",
            "Market Overview", "Market Dynamics - Market Drivers", "Market Dynamics - Market Restrain",
            "Market Dynamics - Market Opp", "Market Dynamics - Market Challenges", "Market Segmentation",
            "Regional Analysis", "Competitive Landscape", "Market Key Segments", "BY geo",
            "Key Global Market Players"
        ];

        // Extract headers from the first row
        const headers = rawData[0];

        // Function to convert Excel serial date to standard date format
        const convertExcelDate = (serial) => {
            if (!serial || isNaN(serial)) return serial; // Return as-is if not a valid serial
            const excelDate = new Date((serial - 25569) * 86400000);
            return excelDate.toISOString().split("T")[0]; // Convert to YYYY-MM-DD
        };

        // Extract data from second row onward
        jsonData = rawData.slice(1).map(row => {
            let rowData = {};
            finalHeaders.forEach((header, index) => {
                if (header && row[index] !== undefined) { // Exclude empty columns
                    rowData[header] = header === "Date" ? convertExcelDate(row[index]) : row[index];
                }
            });
            // Only return rowData if it's not empty
            if (Object.keys(rowData).length > 0) {
                return rowData;
            }

            // If the rowData is empty, return nothing (i.e., skip this row)
            return null;
        }).filter(row => row !== null); // Remove null values (empty rows)

        // Delete the file after processing
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
        });

        res.json({
            message: "File processed successfully. Please confirm if the data is correct.",
            "Number of reports": jsonData.length,
            data: jsonData[0],
        });
    } catch (error) {
        console.error("File processing error:", error);
        res.status(500).json({ message: "Error processing file", error: error.message });
    }
});

const pushCSVData = asyncHandler(async (req, res) => {
    try {
        const { approved } = req.body; // The approval flag is sent in the request body

        //console.log(jsonData);
        
        if (jsonData===null) {
            return res.status(400).json({ message: "No data to approve. Please upload a file first." });
        }

        if (!approved) {
            return res.status(400).json({ message: "Data not approved for upload." });
        }

        if (jsonData.length === 0) {
            return res.status(400).json({ message: "No data to upload." });
        }
        
        // Validate each record before inserting
        const invalidEntries = [];
        const bulkOps = [];

        for (let i = 0; i < jsonData.length; i++) {
            const data = new CSVData(jsonData[i]);
            const validationError = data.validateSync(); // Validate without saving
            
            if (validationError) {
                invalidEntries.push({ id: i, errors: validationError.errors });
            } else {
                bulkOps.push({
                    updateOne: {
                        filter: { "Report ID": jsonData[i]['Report ID'] }, // Check by unique Report ID
                        update: { $set: jsonData[i] }, // Replace the existing document
                        upsert: true // Insert if it doesn't exist
                    }
                });
            }
        }

        // If any data is invalid, return errors and do not insert anything
        if (invalidEntries.length > 0) {
            return res.status(400).json({
                message: "Some records are invalid. No data was pushed.",
                invalidEntries
            });
        }
        
        // Perform bulk update/insert operation
        await CSVData.bulkWrite(bulkOps);


        // Clear stored data after successful save
        jsonData = null;

        res.status(200).json({ message: "Data successfully pushed to the database" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error pushing data to the database", error: error.message });
    }

})

const paginatedCSVData = asyncHandler(async (req, res) => {
    try {
        const industryID = req.query.industryID;
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10; 
        
        const startIndex = (page - 1) * limit;

        const filter = industryID ? { "Industries ID": industryID } : {}; 

        const total = await CSVData.countDocuments(filter); 
        
        const products = await CSVData.find( filter, { Date : 1,'Report Title' : 1,'Industry' : 1, 'Forecast Period': 1, 'CAGR (%)' : 1, 'Market Size - 2025 (USD Billion)' : 1, 'Market Size - 2032 (USD Billion)' : 1,'Report ID' : 1, _id: 0 })
            .limit(limit) 
            .skip(startIndex) 
        
        res.json({
            page,
            total,
            totalPages: Math.ceil(total / limit),
            data: products
        });
    }catch{
        res.status(500).json({ message: "Error fetching data" });
    }
})

const handleReport = asyncHandler(async (req, res) => {
    try {
        const reportId = req.query.reportId;        
        const report = await CSVData.findOne({ "Report ID": reportId });
        //console.log(report);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        res.json(report);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching report" });
    }   
})

export {
    uploadExcelSurveyData,
    pushCSVData,
    paginatedCSVData,
    handleReport
}