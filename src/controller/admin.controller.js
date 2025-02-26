import {asyncHandler} from '../utils/asyncHandler.js';
import {ContactUsForm} from '../model/contactUsForm.model.js';
import {buyReportRequest} from '../model/buyReportForm.model.js';
import {customReportOrDemoReportRequest} from '../model/customReportOrDemoReportRequest.model.js';

const handleContactForms = asyncHandler(async (req, res) => {
    try {
        const { formId } = req.body;
        if (!formId) {
            return res.status(400).json({ message: 'Form ID is missing' });
        }

        let form;
        switch (formId) {
            case 'ContactForm123':
                form = await ContactUsForm.find().sort({ createdAt: -1 });
                break;
            case 'BuyForm123':
                form = await buyReportRequest.find().sort({ createdAt: -1 });
                break;
            case 'CustomizeForm123':
                form = await customReportOrDemoReportRequest.find({ formId: 'CustomizeForm123' }).sort({ createdAt: -1 });
                break;
            case 'DemoForm123':
                form = await customReportOrDemoReportRequest.find({ formId: 'DemoForm123' }).sort({ createdAt: -1 });
                break;
            default:
                return res.status(400).json({ message: 'Invalid form ID' });
        }

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }
        
        res.status(200).json({ form });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching form' });
    }
})

export {
    handleContactForms,
}