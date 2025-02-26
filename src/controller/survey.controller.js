import { asyncHandler } from "../utils/asyncHandler.js";
import { Survey } from '../model/survey.model.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js"

const postSurvey = asyncHandler(async(req,res) => {
    try{
        let { surveyName, description, link } = req.body;

        if (!surveyName?.trim() || !description?.trim() || !link?.trim()) {
            throw new ApiError(400, "Survey Link and Description fields are required");
        }

        // Create the new query
        let surveyDetail = await Survey.create({
            surveyName,
            description,
            link: link,
        });

        const updatedLink = `${link}/${surveyDetail._id}`;

        surveyDetail = await Survey.findByIdAndUpdate(
            surveyDetail._id, 
            { link: updatedLink }, 
            { new: true }
        );

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

const sendSurveyFormData = asyncHandler(async(req,res) => {
    try{   
        const { surveyId } = req.query;
        
        if (!surveyId){
            throw new ApiError(400, "Survey ID is required");
        }
        
        // Find the surveyDetail by ID and send response
        const surveyDetail = await Survey.findById(surveyId).select("surveyName description");

        if (!surveyDetail) {
            return res.status(404).json({ message: "Survey Form not found" });
        }

        res.status(200).json(surveyDetail);
        
    } catch (error) {
        console.error("Error fetching surveyFormData:", error);
        // General error handling
        res.status(500).json({ message: "Internal Server Error", error });
    }
});

const displaySurveys = asyncHandler(async(req,res) => {
    try{
        const page = parseInt(req.query.page) || 1; // Get page number from query parameters
        const limit = parseInt(req.query.limit) || 10; // Get limit from query parameters

        const startIndex = (page - 1) * limit; // Calculate start index

        const surveys = await Survey.find({}).sort({ createdAt: -1 }).limit(limit).skip(startIndex); // Limit documents and skip

        const total = await Survey.countDocuments(); // Get total documents count with filter

        res.json({
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            surveys,
         });
    } catch (error) {
        console.error("Error fetching surveys:", error);
        // General error handling
        res.status(500).json({ message: "Internal Server Error", error });
    }
});

export {
    postSurvey,
    postSurveyForm,
    sendSurveyFormData,
    displaySurveys
}