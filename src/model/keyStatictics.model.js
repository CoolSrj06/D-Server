import mongoose from "mongoose";

const keyStaticticsSchema = new mongoose.Schema({
    "Industry Verticals" : {
        type: Number,
        required: [true, 'Industry Verticals is required'],
        trim: true,
    },
    "Clients Worldwide" : {
        type: Number,
        required: [true, 'Clients Worldwide is required'],
        trim: true,
    },
    "Industries Reports" : {
        type: Number,
        required: [true, 'Industries Reports is required'],
        trim: true,
    },
    "Consulting Reports" : {
        type: Number,
        required: [true, 'Consulting Reports is required'],
        trim: true,
    },
},{timestamps: true});

export const KeyStatictics = mongoose.model('KeyStatictics', keyStaticticsSchema);