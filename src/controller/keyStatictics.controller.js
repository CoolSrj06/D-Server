import { asyncHandler } from "../utils/asyncHandler.js";
import { KeyStatictics } from "../model/keyStatictics.model.js";

const upsertKeyStatistics = asyncHandler(async (req, res) => {
    try {
        const { _id, industryVerticals, clientsWorldwide, industryReports, consultingReports } = req.body;

        if (!industryVerticals || !clientsWorldwide || !industryReports || !consultingReports) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let keyStatistics;

        if (_id) {
            // Try updating the existing document
            keyStatistics = await KeyStatictics.findByIdAndUpdate(
                _id,
                {
                    "Industry Verticals": industryVerticals,
                    "Clients Worldwide": clientsWorldwide,
                    "Industries Reports": industryReports,
                    "Consulting Reports": consultingReports,
                },
                { new: true }
            );
        }

        if (!keyStatistics) {
            // If no _id is provided or update failed (i.e., no document exists), create a new one
            keyStatistics = new KeyStatictics({
                "Industry Verticals": industryVerticals,
                "Clients Worldwide": clientsWorldwide,
                "Industries Reports": industryReports,
                "Consulting Reports": consultingReports,
            });

            await keyStatistics.save();
            return res.status(201).json({
                message: "Key Statistics created successfully",
                data: keyStatistics
            });
        }

        res.json({
            message: "Key Statistics updated successfully",
            data: keyStatistics
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error processing Key Statistics", error: error.message });
    }
});
const getKeyStatictics = asyncHandler(async (req, res) => {
    try {
        const keyStatistics = await KeyStatictics.findOne({});
        res.json({ data: keyStatistics });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching Key Statictics", error: error.message });
    }
});

export { 
    getKeyStatictics,
    upsertKeyStatistics
}