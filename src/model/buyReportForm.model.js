import mongoose from "mongoose";

const buyReportFormSchema = new mongoose.Schema({
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
        lowercase: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Please enter a valid email address',
        ],
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        index: true,
        minlength: [10, 'Phone number must be at least 10 characters long'],
        maxlength: [15, 'Phone number cannot exceed 15 characters'],
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
        minlength: [2, 'Company name must be at least 2 characters long'],
        maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
        minlength: [2, 'Company name must be at least 2 characters long'],
        maxlength: [100, 'Company name cannot exceed 100 characters'],
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
    reportId: {
        type: String,
        required: [true, 'Report ID is required'],
        trim: true,
    },
    formId: {
        type: String,
        required: [true, 'Form ID is required'],
        trim: true,
    },
    assignedTo: {
        // type should be the id of sales user
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
}, { timestamps: true });

export const buyReportRequest =  mongoose.model('buyReportRequest', buyReportFormSchema);