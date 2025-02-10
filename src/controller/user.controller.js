import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Survey } from '../model/survey.model.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import xlsx from "xlsx";
import fs from "fs";
import { User } from "../model/admin.model.js";

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

const uploadExcelSurveyData = asyncHandler(async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Read the uploaded Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0]; // Get first sheet
        const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Return JSON response
        //console.log(jsonData);

        // Delete the file after processing
        fs.unlink(req.file.path, (err) => {
            if (err) {
            console.error("Error deleting file:", err);
            } else {
            console.log("File deleted:", req.file.path);
            }
        });
        
        res.json({ data: jsonData });
    } catch (error) {
        res.status(500).json({ message: "Error processing file", error });
    }
});

const handleUserSignUp = asyncHandler(async (req, res) => {
    const { fullName, username, password, userType } = req.body;
    
    if ([fullName, userType, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    
    const existedUser = await User.findOne({
        $or: [{ username }]
    });
    
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }
    
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

export {
    postSurvey,
    postSurveyForm,
    downloadSurveyData,
    uploadExcelSurveyData,
    handleUserSignUp,
    handleAdminLogin,
    handleSalesLogin,    
};
