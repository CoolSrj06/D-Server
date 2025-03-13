import { asyncHandler } from "../utils/asyncHandler.js";
import { Survey } from '../model/survey.model.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js"
import xlsx from "xlsx";

const postSurvey = asyncHandler(async(req,res) => {
    try{
        let { surveyName, description, link } = req.body;

        if (!surveyName?.trim() || !description?.trim() || !link?.trim()) {
            throw new ApiError(400, "Survey Link and Description fields are required");
        }

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
    } catch (error) {
        console.error("Error in postDoubt:", error);
        throw error; 
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
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;

        const startIndex = (page - 1) * limit; 

        const surveys = await Survey.find({})
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(startIndex)
            .select("surveyName description link createdAt surveyFormData");

        const surveysWithLength = surveys.map(survey => ({
            _id: survey._id,
            surveyName: survey.surveyName,
            description: survey.description,
            link: survey.link,
            createdAt: survey.createdAt,
            surveyFormDataLength: survey.surveyFormData.length, 
        }));

        const total = await Survey.countDocuments(); 

        res.json({
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            surveys: surveysWithLength,
        });
    } catch (error) {
        console.error("Error fetching surveys:", error);
        res.status(500).json({ message: "Internal Server Error", error });
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
    downloadSurveyData
}