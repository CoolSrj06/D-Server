import mongoose from 'mongoose';

const CSVDataSchema = mongoose.Schema({
    SrNo: { type: Number },
    Date: { type: String },
    "Industries ID": { type: String },
    "Report Title": { type: String },
    "Report ID": { type: String },
    "Historical Range": { type: String },
    "Base Year": { type: Number },
    "Forecast Period": { type: String },
    Industry: { type: String },
    "Market Size - 2025 (USD Billion)" : { type: String },
    "Market Size - 2032 (USD Billion)" : { type: String },
    "CAGR (%)": { type: String },
    "Market Overview": { type: String },
    "Market Dynamics - Market Drivers": { type: String },
    "Market Dynamics - Market Restrain": { type: String },
    "Market Dynamics - Market Opp": { type: String },
    "Market Dynamics - Market Challenges": { type: String },
    "Market Segmentation": { type: String },
    "Regional Analysis": { type: String },
    "Competitive Landscape": { type: String },
    "Market Key Segments": { type: String },
    "Key Global Market Players": { type: String }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

export const CSVData = mongoose.model("CSVData", CSVDataSchema);