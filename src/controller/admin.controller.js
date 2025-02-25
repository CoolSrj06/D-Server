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

        if(formId === 'ContactForm123') {
            // it true fetch all data from ContactUsForm in order of creation
            const form = await ContactUsForm.find().sort({ createdAt: -1 });

            if (!form) {
                return res.status(404).json({ message: 'Form not found' });
            }

            return res.status(200).json({ form });
        }else if(formId === 'BuyForm123') {
            // it true fetch all data from buyReportRequest in order of creation
            const form = await buyReportRequest.find().sort({ createdAt: -1 });

            if (!form) {
                return res.status(404).json({ message: 'Form not found' });
            }

            return res.status(200).json({ form });
        }else if(formId === 'CustomizeForm123') {
            // it true fetch only data that has formId: CustomizeForm123 from customReportOrDemoReportRequest in order of creation
            const form = await customReportOrDemoReportRequest.find({ formId: 'CustomizeForm123' }).sort({ createdAt: -1 });

            if (!form) {
                return res.status(404).json({ message: 'Form not found' });
            }

            return res.status(200).json({ form });
        }else if(formId === 'DemoForm123') {
            // it true fetch only data that has formId: DemoForm123 from customReportOrDemoReportRequest in order of creation
            const form = await customReportOrDemoReportRequest.find({ formId: 'DemoForm123' }).sort({ createdAt: -1 });

            if (!form) {
                return res.status(404).json({ message: 'Form not found' });
            }

            return res.status(200).json({ form });
        }
        return res.status(400).json({ message: 'Invalid form ID' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching form' });
    }
})

export {
    handleContactForms,
}