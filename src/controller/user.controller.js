import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Survey } from '../model/survey.model.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import XLSX from "xlsx";


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
 

    const worksheet = XLSX.utils.aoa_to_sheet(dataWithHeading); // Converts array of arrays to a worksheet
    const workbook = XLSX.utils.book_new(); // Creates a new workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "SurveyData"); // Adds the worksheet to the workbook

    // Step 4: Write the workbook to a buffer
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Step 5: Send the Excel file as a response
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=survey-data.xlsx");
    res.send(excelBuffer);
})

export {
    postSurvey,
    postSurveyForm,
    downloadSurveyData,
};
