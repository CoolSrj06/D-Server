import {asyncHandler} from '../utils/asyncHandler.js';
import { CSVData } from "../model/CSV.model.js";

const setFeatured = asyncHandler(async (req, res) => {
    try {
        const { replacingId, newId } = req.body;

        if (!replacingId || !newId) {
            return res.status(400).json({ message: "Replacing and New IDs are required" });
        }

        // Check if the newId is already featured
        const newFeaturedCheck = await CSVData.findOne({ "Report ID": newId });
        
        if (!newFeaturedCheck) {
            return res.status(404).json({ message: "New featured document not found" });
        }
        
        if (newFeaturedCheck["Featured"]) {
            return res.status(400).json({ message: "The new document is already featured" });
        }
 

        // Update the existing featured document to false
        const existingFeatured = await CSVData.findOneAndUpdate(
            { "Report ID": replacingId }, 
            { $set: { "Featured": false } },
            { new: true }
        );

        if (!existingFeatured) {
            return res.status(404).json({ message: "No existing featured document found" });
        }

        // Update the new featured document to true
        const newFeatured = await CSVData.findOneAndUpdate(
            { "Report ID": newId }, 
            { $set: { "Featured": true } },
            { new: true }
        );

        if (!newFeatured) {
            return res.status(404).json({ message: "No new featured document found" });
        }

        return res.status(200).json({ message: "Featured document updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating featured document", error: error.message });
    }
});

const featuredReports = asyncHandler(async (req, res) => {
    try {
        // Use select({ "Report Title": 1 }) instead of select("Report Title") to ensure Mongoose treats it as a single field.
        const featuredReports = await CSVData.find({ "Featured": true }).select({"Report ID": 1});
        res.json({ data: featuredReports });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching featured reports", error: error.message });
    }
});

const fullDetailOfFeaturedReports = asyncHandler(async (req, res) => {
    try {
        const featuredReports = await CSVData.find({ "Featured": true }).select({ "Report ID": 1, "Report Title": 1,
             "Industries ID": 1, "Market Size - 2025 (USD Billion)": 1, "Market Size - 2032 (USD Billion)": 1, "CAGR (%)": 1, "Forecast Period": 1 });
        res.json(
            { 
                reports : featuredReports.length ,
                data: featuredReports 
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching featured reports", error: error.message });
    }
});

export { 
    setFeatured,
    featuredReports,
    fullDetailOfFeaturedReports
 };
            