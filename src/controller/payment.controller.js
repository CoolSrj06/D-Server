import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from 'axios';

async function getAccessToken() {
    const response = await axios.post(
        "https://api-m.sandbox.paypal.com/v1/oauth2/token",
        "grant_type=client_credentials",
        {
            auth: {
                username: CLIENT_ID,
                password: CLIENT_SECRET,
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );
    return response.data.access_token;
}

const createOrder = asyncHandler(async (req, res) => {
    try {
        const { amount, currency, description, reportId } = req.body;
        const accessToken = await getAccessToken();
        const order = await axios.post(
            "https://api-m.sandbox.paypal.com/v2/checkout/orders",
            {
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: currency,
                            value: amount,
                        },
                        description: description,
                    },
                ],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
            }
        );
        res.status(200).json(new ApiResponse(200, "Order created successfully", order.data));
    }
    catch (error) {
        throw new ApiError(500, "Error creating order", error.message);
    }
});

export {
    createOrder,
}