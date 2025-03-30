import { asyncHandler } from "../utils/asyncHandler.js";
import { Survey } from '../model/survey.model.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js"
import xlsx from "xlsx";
import { User } from "../model/admin.model.js";

const postSurvey = asyncHandler(async (req, res) => {
    try {
        let { surveyName, description, link } = req.body;
        const userId = req.user.id; // Assuming authentication middleware sets req.user

        if (!surveyName?.trim() || !description?.trim() || !link?.trim()) {
            throw new ApiError(400, "Survey Name, Link, and Description are required");
        }

        let surveyDetail = await Survey.create({
            surveyName,
            description,
            link,
            createdBy: userId, // Storing the creator's ID
        });

        const updatedLink = `${link}/${surveyDetail._id}`;

        surveyDetail = await Survey.findByIdAndUpdate(
            surveyDetail._id, 
            { link: updatedLink }, 
            { new: true }
        );

        return res.status(201).json(surveyDetail);
    } catch (error) {
        console.error("Error in postSurvey:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
});


const postSurveyForm = asyncHandler(async(req,res,next) => {
    try{
        const { firstName, lastName, email, phone, jobTitle, companyName, subject, message, surveyId } = req.body;
        
        if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim() || 
            !jobTitle?.trim() || !companyName?.trim() || !subject?.trim() || !message?.trim() || !email?.trim()){
            throw new ApiError(400, "All feilds are required fields are required");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingSurveyResponse = await Survey.findOne({
            surveyFormData: {
                $elemMatch: { 
                    email: email.trim(),
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    message: message.trim(),
                    phone: phone.trim(),
                    jobTitle: jobTitle.trim(),
                    companyName: companyName.trim(),
                    subject: subject.trim(), 
                },
            },
        });
        
        if (existingSurveyResponse) {
            return next(new ApiError(404, "Survey Detail not found"));
        }
        
        const newSurvey = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            jobTitle: jobTitle.trim(),
            companyName: companyName.trim(),
            subject: subject.trim(),
            message: message.trim(),
        };
        
        
        const surveyDetail = await Survey.findById(surveyId);
    
        if (!surveyDetail) {
            return next(new ApiError(404, "Survey Detail not found"));
        }
        
        surveyDetail.surveyFormData.push(newSurvey);
        const updatedSurvey = await surveyDetail.save();
    
        res.status(201).json(updatedSurvey);
    } catch (error) {
        console.error("Error submitting surveyForm:", error);
        next(error); 
    }
});

const sendSurveyFormData = asyncHandler(async(req,res) => {
    try{   
        const { surveyId } = req.query;
        
        if (!surveyId){
            throw new ApiError(400, "Survey ID is required");
        }
        
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

const displaySurveys = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id; // User ID from authentication
        const userType = req.user.userType; // Assuming userType is available in req.user
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        // Define the filter condition
        const filter = userType === "admin" ? {} : { createdBy: userId };

        // Fetch surveys
        const surveys = await Survey.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(startIndex)
            .select("surveyName description link createdAt surveyFormData createdBy");

        // Fetch all user IDs from the surveys
        const userIds = [...new Set(surveys.map(survey => survey.createdBy))]; // Unique user IDs

        // Fetch user details
        const users = await User.find({ _id: { $in: userIds } }).select("fullName");
        console.log(users)
        // Create a map of userId -> fullName
        const userMap = users.reduce((acc, user) => {
            acc[user._id] = user.fullName;
            return acc;
        }, {});

        // Map surveys to include fullName
        const surveysWithUsernames = surveys.map(survey => {
            const surveyData = {
                _id: survey._id,
                surveyName: survey.surveyName,
                description: survey.description,
                link: survey.link,
                createdAt: survey.createdAt,
                surveyFormDataLength: survey.surveyFormData.length,
            };

            if (userType === "admin") {
                surveyData.createdBy = userMap[survey.createdBy] || "Unknown"; // Add only for admins
            }

            return surveyData;
        });

        const total = await Survey.countDocuments(filter);

        res.json({
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            surveys: surveysWithUsernames,
        });
    } catch (error) {
        console.error("Error fetching surveys:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

const deleteSurveys = asyncHandler(async (req, res) => {
    try {
        // recieve id from req.body, extract userType from userType and delete a perticular servey report
        const { surveyId } = req.body;
        const userType = req.user.userType;
        if (!surveyId) {
            return res.status(400).json({ message: "Survey ID is required" });
        }

        // Check if the user is an admin
        if (userType!== "admin") {
            return res.status(403).json({ message: "Only admins can delete surveys" });
        }

        // Delete the survey
        await Survey.findByIdAndDelete(surveyId);
        
        // Check if the survey was found and deleted
        const deletedSurvey = await Survey.findById(surveyId);
        if (!deletedSurvey) {
            return res.status(200).json({ message: 'Survey deleted successfully.' });
        }
        return res.status(200).json({ message: 'Survey deleted successfully.' });
    } catch (error) {
        console.error('Error deleting surveys:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
});


const downloadSurveyData = asyncHandler(async (req, res) => {
    const { surveyId } = req.query;
    let survey = [];
    const surveyData = await Survey.findById(surveyId);

    if (!surveyData) {
        return res.status(404).json({ message: "Survey not found" });
    }
    const { surveyName, description, link, surveyFormData } = surveyData;

    if (surveyFormData && surveyFormData.length > 0) {
        surveyFormData.forEach((formEntry) => {
            survey.push({
                surveyName,
                description,
                link,
                firstName: formEntry.firstName || "",
                lastName: formEntry.lastName || "",
                email: formEntry.email || "",
                phone: formEntry.phone || "",
                jobTitle: formEntry.jobTitle || "",
                companyName: formEntry.companyName || "",
                subject: formEntry.subject || "",
                message: formEntry.message || "",
            });
        });
    } else {
        survey.push({
            surveyName,
            description,
            link,
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            jobTitle: "",
            companyName: "",
            subject: "",
            message: "",
        });
    }

    const heading = [
        "Survey Name", "Description", "Link", "First Name", "Last Name",
        "Email", "Phone", "Job Title", "Company Name", "Subject", "Message"
    ];

    const dataWithHeading = [heading, ...survey.map(item => [
        item.surveyName, item.description, item.link, item.firstName, item.lastName,
        item.email, item.phone, item.jobTitle, item.companyName, item.subject, item.message
    ])];

    const worksheet = xlsx.utils.aoa_to_sheet(dataWithHeading);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "SurveyData");

    const excelBuffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=survey-data.xlsx");
    res.send(excelBuffer);
});

export {
    postSurvey,
    postSurveyForm,
    sendSurveyFormData,
    displaySurveys,
    downloadSurveyData,
    deleteSurveys
}