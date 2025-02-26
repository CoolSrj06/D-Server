import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Survey } from '../model/survey.model.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import xlsx from "xlsx";
import { User } from "../model/admin.model.js";
import { CSVData } from "../model/CSV.model.js";

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



export {
    downloadSurveyData,
    handleUserSignUp,
    handleAdminLogin,
    handleSalesLogin,  
    paginatedCSVData,  
    handleReport,
};
