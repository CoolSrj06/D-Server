import mongoose from 'mongoose';
import { surveyForm } from './surveyForm.model.js'; // Import the answer schema
const { Schema } = mongoose;

// Schema for doubts
const survey = new mongoose.Schema({
    surveyName: {
        type: String,
        required: [true, 'survey name is required'],
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
}, { timestamps: true });

// Create the Survey model from the schema
export const Survey = mongoose.model('Survey', survey);
