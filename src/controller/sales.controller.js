import {asyncHandler} from '../utils/asyncHandler.js';
import {ContactUsForm} from '../model/contactUsForm.model.js';
import {buyReportRequest} from '../model/buyReportForm.model.js';
import {customReportOrDemoReportRequest} from '../model/customReportOrDemoReportRequest.model.js';

const handleContactForms = asyncHandler(async (req, res) => {
    try {
        const { formId } = req.body;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const startIndex = (page - 1) * limit; 

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

        const maskedForm = form.map(entry => {
            if (entry.email) {
                const [localPart, domain] = entry.email.split('@');
                const maskedLocalPart = '*'.repeat(localPart.length);
                return { ...entry.toObject(), email: `${maskedLocalPart}@${domain}` };
            }
            return entry;
        });

        const totalDocuments = form.length; 

        res.status(200).json({ 
            page,
            limit,
            totalDocuments,
            totalPages: Math.ceil(totalDocuments / limit),  
            form: maskedForm, 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching form' });
    }
});   

const tasksAssignedToMe = asyncHandler(async (req, res) => {
    try {
        const { userId, formId } = req.body;

        if (!userId || !formId) {
            return res.status(400).json({ message: 'User ID and Form ID are required' });
        }
        
        let form;
        switch (formId) {
            case 'ContactForm123':
                form = await ContactUsForm.find({ assignedTo: userId }).sort({ createdAt: -1 });
                break;
            case 'BuyForm123':
                form = await buyReportRequest.find({ assignedTo: userId }).sort({ createdAt: -1 });
                break;
            case 'CustomizeForm123':
                form = await customReportOrDemoReportRequest.find({ formId: 'CustomizeForm123', assignedTo: userId }).sort({ createdAt: -1 });
                break;
            case 'DemoForm123':
                form = await customReportOrDemoReportRequest.find({ formId: 'DemoForm123', assignedTo: userId }).sort({ createdAt: -1 });
                break;
            default:
                return res.status(400).json({ message: 'Invalid form ID' });
        }
        
        if (!form) {
            return res.status(404).json({ message: 'No tasks assigned to the user' });
        }

        const maskedForm = form.map(entry => {
            if (entry.email) {
                const [localPart, domain] = entry.email.split('@');
                const maskedLocalPart = '*'.repeat(localPart.length);
                return { ...entry.toObject(), email: `${maskedLocalPart}@${domain}` };
            }
            return entry;
        });
        
        res.status(200).json({ form: maskedForm });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching tasks' });
    }
});

export { 
    handleContactForms,
    tasksAssignedToMe
};
