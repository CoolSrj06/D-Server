import mongoose from "mongoose";
const { Schema } = mongoose;

export const surveyForm = new mongoose.Schema({
    name: {
        type: String,
        // required: [true, 'Name is required'], // Enhanced validation
        // trim: true,
    },
    email: {
        type: String,
        // required: [true, 'Email is required'], // Enhanced validation
        // match: [
        //     /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        //     'Please enter a valid email address',
        // ]
    },
    message: {
        type: String,
        // required: [true, 'Message is required'],
    },
}, { timestamps: true });