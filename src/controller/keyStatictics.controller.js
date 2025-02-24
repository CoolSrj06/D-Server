import { asyncHandler } from "../utils/asyncHandler.js";
import { KeyStatictics } from "../model/keyStatictics.model.js";

// Will be used only once the to creating database, and use of this api will be abandoned
const assignKeyStatictics = asyncHandler( async(req, res) => {
    try {
        const { clientsWorldwide, industryReports, consultingReports } = req.body;
        if (!clientsWorldwide || !industryReports || !consultingReports) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newKeyStatictics = new KeyStatictics({
            "Clients Worldwide" : clientsWorldwide,
            "Industries Reports" : industryReports,
            "Consulting Reports" : consultingReports,
        });

        // Create a new KeyStat
        await newKeyStatictics.save();

        res.status(201).json({
            message: "Key Statictics updated successfully",
            data: newKeyStatictics
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error submitting form", error: error.message });
    }    
})

// Update Key Statictics, this function will be given to client to update his website key statictics
const updateKeyStatictics = asyncHandler(async (req, res) => {
    try {
        const { _id, clientsWorldwide, industryReports, consultingReports } = req.body;
        
        if (!_id) {
            return res.status(400).json({ message: "ID is required" });
        }
        
        const updatedKeyStatictics = await KeyStatictics.findByIdAndUpdate(
            _id,
            {
                "Clients Worldwide" : clientsWorldwide,
                "Industries Reports" : industryReports,
                "Consulting Reports" : consultingReports,
            },
            { new: true }
        );
        
        if (!updatedKeyStatictics) {
            return res.status(404).json({ message: "Key Statictics not found" });
        }
        
        res.json({
            message: "Key Statictics updated successfully",
            data: updatedKeyStatictics
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating Key Statictics", error: error.message });
    }
});

// Fetch Key Statictics
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
    assignKeyStatictics,
    getKeyStatictics,
    updateKeyStatictics
}