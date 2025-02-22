import mongoose from "mongoose";

const customReportRequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
    },
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
    },
    jobTitle: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
    },
    message : {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
    },
    reportId: {
        type: String,
        required: [true, 'Report ID is required'],
        trim: true,
    },
}, { timestamps: true });

export const customReportRequest =  mongoose.model('CustomReportRequest', customReportRequestSchema);