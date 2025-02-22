import mongoose from "mongoose";

const buyReportFormSchema = new mongoose.Schema({
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
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
    },
    reportId: {
        type: String,
        required: [true, 'Report ID is required'],
        trim: true,
    },
}, { timestamps: true });

export const buyReportRequest =  mongoose.model('buyReportRequest', buyReportFormSchema);