import {asyncHandler} from '../utils/asyncHandler.js';
import {ContactUsForm} from '../model/contactUsForm.model.js';
import {buyReportRequest} from '../model/buyReportForm.model.js';
import {customReportOrDemoReportRequest} from '../model/customReportOrDemoReportRequest.model.js';

const handleContactForms = asyncHandler(async (req, res) => {
    try {
        const { formId } = req.body;
        const page = parseInt(req.query.page) || 1; // Get page number from query parameters
        const limit = parseInt(req.query.limit) || 10; // Get limit from query parameters

        const startIndex = (page - 1) * limit; // Calculate start index
        
        if (!formId) {
            return res.status(400).json({ message: 'Form ID is missing' });
        }

        let form;
        switch (formId) {
            case 'ContactForm123':
                form = await ContactUsForm.find().sort({ createdAt: -1 }).limit(limit).skip(startIndex);
                break;
            case 'BuyForm123':
                form = await buyReportRequest.find().sort({ createdAt: -1 }).limit(limit).skip(startIndex);
                break;
            case 'CustomizeForm123':
                form = await customReportOrDemoReportRequest.find({ formId: 'CustomizeForm123' }).sort({ createdAt: -1 }).limit(limit).skip(startIndex);
                break;
            case 'DemoForm123':
                form = await customReportOrDemoReportRequest.find({ formId: 'DemoForm123' }).sort({ createdAt: -1 }).limit(limit).skip(startIndex);
                break;
            default:
                return res.status(400).json({ message: 'Invalid form ID' });
        }

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        const totalDocuments = await form.length; // Count total documents

        res.status(200).json({ 
            page,
            limit,
            totalDocuments,
            totalPages: Math.ceil(totalDocuments / limit),  // Calculate total pages based on total documents and limit
            form,
         });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching form' });
    }
})

export {
    handleContactForms,
}