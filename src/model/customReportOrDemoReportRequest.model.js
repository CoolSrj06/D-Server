import mongoose from "mongoose";

const customReportOrDemoReportRequestSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'first name is required'],
        trim: true,
        index: true,
        minlength: [3, 'first name must be at least 3 characters long'],
        maxlength: [50, 'first name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'last name is required'],
        trim: true,
        index: true,
        minlength: [3, 'last name must be at least 3 characters long'],
        maxlength: [50, 'last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        index: true,
        lowercase: true,
        minlength: [6, 'Email must be at least 6 characters long'],
        maxlength: [50, 'Email cannot exceed 50 characters']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        index: true,
        minlength: [5, 'Phone number must be at least 10 characters long'],
        maxlength: [17, 'Phone number cannot exceed 17 characters'],
        match: [
            /^\+?[1-9]\d{1,14}$/,
            'Please enter a valid phone number (E.164 format)',
        ],
    },
    jobTitle: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
        index: true,
        minlength: [3, 'Job title must be at least 3 characters long'],
        maxlength: [50, 'Job title cannot exceed 50 characters']
    },
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        index: true,
        minlength: [3, 'Company name must be at least 3 characters long'],
        maxlength: [50, 'Company name cannot exceed 50 characters']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        index: true,
        minlength: [3, 'Subject must be at least 3 characters long'],
        maxlength: [50, 'Subject cannot exceed 50 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        index: true,
        minlength: [3, 'Message must be at least 3 characters long'],
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    formId: {
        type: String,
        required: [true, 'Form ID is required'],
        trim: true,
    },
    reportId: {
        type: String,
        required: [true, 'Report ID is required'],
        trim: true,
    },
    assignedTo: {
        // type should be the id of sales user
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
}, { timestamps: true });

export const customReportOrDemoReportRequest =  mongoose.model('customReportOrDemoReportRequest', customReportOrDemoReportRequestSchema);