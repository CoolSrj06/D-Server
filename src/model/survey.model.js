import mongoose from 'mongoose';
import { surveyForm } from './surveyForm.model.js'; // Import the answer schema

// Schema for surveys
const surveySchema = new mongoose.Schema({
    surveyName: {
        type: String,
        required: [true, 'Survey name is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    link: {
        type: String, // Change from Array to String
        default: '',  // Default to an empty string
    },
    surveyFormData: [surveyForm], // Embeds multiple answers
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true // Ensure it's always set
    }
}, { timestamps: true });

// Create the Survey model from the schema
export const Survey = mongoose.model('Survey', surveySchema);
