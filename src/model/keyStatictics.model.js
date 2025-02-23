import mongoose from "mongoose";

const keyStaticticsSchema = new mongoose.Schema({
    "Clients Worldwide" : {
        type: String,
        required: [true, 'Clients Worldwide is required'],
        trim: true,
    },
    "Industries Reports" : {
        type: String,
        required: [true, 'Industries Reports is required'],
        trim: true,
    },
    "Consulting Reports" : {
        type: String,
        required: [true, 'Consulting Reports is required'],
        trim: true,
    },
},{timestamps: true});

export const KeyStatictics = mongoose.model('KeyStatictics', keyStaticticsSchema);