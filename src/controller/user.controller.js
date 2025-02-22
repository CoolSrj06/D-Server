import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Survey } from '../model/survey.model.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import xlsx from "xlsx";
import fs from "fs";
import { User } from "../model/admin.model.js";
import { CSVData } from "../model/CSV.model.js";
import { ContactForm } from "../model/contactForm.model.js";

const generateAccessAndRefreshTokens = (async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: true})

        return {accessToken, refreshToken}

    } catch (err) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
    }
})

const postSurvey = asyncHandler(async(req,res) => {
    try{
        const { surveyName, description, link } = req.body;

        if (!surveyName?.trim() || !description?.trim() || !link?.trim()) {
            throw new ApiError(400, "Survey Link and Description fields are required");
        }

        // Create the new query
        const surveyDetail = await Survey.create({
            surveyName,
            description,
            link: link,
        });
        return res.status(201)
            .json(
                new ApiResponse(201, surveyDetail, "Query posted successfully")
            );
    } catch (error) {
        console.error("Error in postDoubt:", error);
        throw error; // AsyncHandler will catch and return the error
    }
});

const postSurveyForm = asyncHandler(async(req,res) => {
    try{
        const { name, email, message, surveyId } = req.body;
        
        if (!name?.trim() || !message?.trim() || !email?.trim()){
            throw new ApiError(400, "name, message and email fields are required");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Check for duplicate survey response
        const existingSurveyResponse = await Survey.findOne({
            surveyFormData: {
                $elemMatch: { 
                    email: email.trim(),
                    name: name.trim(),
                    message: message.trim(), 
                },
            },
        });

        console.log(existingSurveyResponse); // Debugging: Check the existingSurveyResponse
        
        if (existingSurveyResponse) {
            throw new ApiError(400,"Duplicate form submission detected");
        }
        //Create a new answer object
        const newSurvey = {
            name: name.trim(),
            email: email.trim(), // Ensure no leading/trailing spaces
            message: message.trim(), // Ensure no leading/trailing spaces
        };
        
        // Find the surveyDetail by ID and update it
        const surveyDetail = await Survey.findById(surveyId);
    
        if (!surveyDetail) {
            return res.status(404).json({ message: "Survey Detail not found" });
        }
        
        // Add the new answer to the answers array
        surveyDetail.surveyFormData.push(newSurvey);
        const updatedSurvey = await surveyDetail.save();
    
        // Return the updated query
        res.status(201).json(updatedSurvey);
    } catch (error) {
        console.error("Error submitting surveyForm:", error);
        // General error handling
        res.status(500).json({ message: "Internal Server Error", error });
    }
});  

const downloadSurveyData = asyncHandler(async (req, res) => {
    let survey = [];
    const surveyData = await Survey.find({});

    // Step 2: Flatten the data based on surveyFormData presence
    surveyData.forEach((sample) => {
        const { surveyName, description, link, surveyFormData } = sample;

        // If surveyFormData has entries, repeat surveyName, description, link for each formEntry
        if (surveyFormData && surveyFormData.length > 0) {
            surveyFormData.forEach((formEntry) => {
                survey.push({
                    surveyName,
                    description,
                    link,
                    name: formEntry.name, // Name from surveyFormData
                    email: formEntry.email, // Email from surveyFormData
                    message: formEntry.message, // Message from surveyFormData
                });
            });
        } else {
            // If surveyFormData is empty, still push the surveyName, description, and link
            survey.push({
                surveyName,
                description,
                link,
                name: "", // Empty value for name when surveyFormData is empty
                email: "", // Empty value for email when surveyFormData is empty
                message: "", // Empty value for message when surveyFormData is empty
            });
        }
    });


    //console.log(survey); // Debugging: Check the collected data
    
    // Step 3: Add headings and convert data to Excel sheet
    const heading = ["Survey Name", "Description", "Link", "Name", "Email", "Message"]; // Add the relevant field names
    const dataWithHeading = [heading, ...survey.map(item => [
    item.surveyName, 
    item.description, 
    item.link, 
    item.name,  // Name from surveyFormData
    item.email, // Email from surveyFormData
    item.message // Message from surveyFormData
    ])];
 

    const worksheet = xlsx.utils.aoa_to_sheet(dataWithHeading); // Converts array of arrays to a worksheet
    const workbook = xlsx.utils.book_new(); // Creates a new workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, "SurveyData"); // Adds the worksheet to the workbook

    // Step 4: Write the workbook to a buffer
    const excelBuffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Step 5: Send the Excel file as a response
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=survey-data.xlsx");
    res.send(excelBuffer);
})


const handleUserSignUp = asyncHandler(async (req, res) => {
    const { fullName, username, password, userType } = req.body;

    console.log(fullName, username, password, userType);
    
    
    if ([fullName, userType, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    
    const existedUser = await User.findOne({
        $or: [{ username }]
    });
    
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }
    
    //console.log(existedUser);
    
    try {
        const user = await User.create({
        fullName,
        userType,
        password,
        username: username.toLowerCase(),
        });    
    
        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
        }
    
        return res.status(201).json(createdUser);
    } catch (error) {
        if (error.name === "ValidationError") {
        
        // Handle Mongoose validation errors
        const validationErrors = Object.keys(error.errors).map(field => ({
            field,
            message: error.errors[field].message
        }));
        throw new ApiError(400, "Validation failed", validationErrors);
        }
    
        // Handle other errors
        throw new ApiError(500, "Something went wrong while registering the user");
    }
})

const handleAdminLogin = asyncHandler(async (req, res) => {
    const { userType, username, password } = req.body;

    //console.log(userType, username, password);
    
    if (userType !== 'admin' ) {
        throw new ApiError(401, "Only Admin can login");
    }

    if(!username || !password) {
        throw new ApiError(400, "Username and password are required");
    }
    
    const user = await User.findOne({ username: username }).select('+password'); // Include the password for comparison

    if (!user) {
        // User not found
        throw new ApiError(404, "No such admin")
    }

    // Compare password (make sure to hash passwords in your user model)
    //console.log(password, "password");
    
    const isPasswordValid = await user.isPasswordCorrect(password)

    //console.log(isPasswordValid);
    
    if(!isPasswordValid){
        throw new ApiError(401, "Incorrect password")
    }

    const { accessToken,refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select( " -password -refreshToken" )

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(loggedInUser);
})

const handleSalesLogin = asyncHandler(async (req, res) => {
    const { userType, username, password } = req.body;

    if (userType !== "sales" ) {
        throw new ApiError(401, "Only Sales can login");
    }

    if(!username || !password) {
        throw new ApiError(400, "Username and password are required");
    }
    
    const user = await User.findOne({ username: username }).select('+password'); // Include the password for comparison

    if (!user) {
        // User not found
        throw new ApiError(404, "No such admin")
    }

    // Compare password (make sure to hash passwords in your user model)
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Incorrect password")
    }

    const { accessToken,refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select( " -password -refreshToken" )

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(loggedInUser);
})

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
            "SrNo.", "Date", "Industries ID", "Report Title", "Report ID", "Historical Range",
            "Base Year", "Forecast Period", "Industry", "Market Size - 2025 (USD Billion)", "Market Size - 2032 (USD Billion)", "Market Size (USD Billion)", "CAGR (%)",
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
            return rowData;
        });

        // Delete the file after processing
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
        });

        res.json({
            message: "File processed successfully. Please confirm if the data is correct.",
            data: jsonData
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

        //console.log(jsonData); // Debugging: Check the jsonData
        
        // Create a new document with the stored JSON data
        const newDataArray = jsonData.map(data => new CSVData(data));

        //console.log(newData); // Debugging: Check the newData
        
        // Save the data in the MongoDB database
        await Promise.all(newDataArray.map(newData => newData.save()));

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
        const page = parseInt(req.query.page) || 1; // Get page number from query parameters
        const limit = parseInt(req.query.limit) || 10; // Get limit from query parameters

        //console.log(industryID, page, limit); // Debugging: Check the query parameters
        

        const startIndex = (page - 1) * limit; // Calculate start index

        // Build query filter
        const filter = industryID ? { "Industries ID": industryID } : {}; // Apply filter only if industryID is provided
        //console.log(filter);

        const total = await CSVData.countDocuments(filter); // Get total documents count with filter
        //console.log(total);
        

        const products = await CSVData.find( filter, { Date : 1,'Report Title' : 1,'Industry' : 1, 'Forecast Period': 1, 'CAGR (%)' : 1, 'Market Size - 2025 (USD Billion)' : 1, 'Market Size - 2032 (USD Billion)' : 1,'Report ID' : 1, _id: 0 })
            .limit(limit) // Limit documents
            .skip(startIndex) // Skip documents
        
        res.json({
            page,
            total,
            totalPages: Math.ceil(total / limit), // Calculate total pages
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

export {
    postSurvey,
    postSurveyForm,
    downloadSurveyData,
    uploadExcelSurveyData,
    handleUserSignUp,
    handleAdminLogin,
    handleSalesLogin,  
    pushCSVData,
    paginatedCSVData,  
    handleReport,
    handleContactForm,
};
