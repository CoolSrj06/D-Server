import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function getAccessToken() {
  try {
    const response = await axios.post(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      "grant_type=client_credentials",
      {
        auth: {
          username: process.env.PAYPAL_CLIENT_ID,
          password: process.env.PAYPAL_CLIENT_SECRET_KEY,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error getting access token:",
      error.response?.data || error.message,
    );
    throw new ApiError(500, "Failed to get PayPal access token");
  }
}

const createOrder = asyncHandler(async (req, res) => {
  try {
    const { amount, currency, description, reportId } = req.body;

    if (!amount || !currency || !description) {
      throw new ApiError(400, "Missing required fields");
    }

    const accessToken = await getAccessToken();

    const orderResponse = await axios.post(
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
            custom_id: reportId || "", // Optional tracking ID
          },
        ],
        application_context: {
          return_url: "http://127.0.0.1:5500", // ✅ Redirect after success
          cancel_url:
            "https://github.com/CoolSrj06/D-Server/blob/master/src/app.js", // ✅ Redirect if user cancels
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const approvalUrl = orderResponse.data.links.find(
      (link) => link.rel === "approve",
    )?.href;

    if (!approvalUrl) {
      throw new ApiError(500, "Approval URL not found in PayPal response");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, "Order created successfully", { approvalUrl }),
      );
  } catch (error) {
    console.error(
      "Error creating order:",
      error.response?.data || error.message,
    );
    throw new ApiError(500, "Error creating order");
  }
});

const captureOrder = asyncHandler(async (req, res) => {
  try {
    const { orderID } = req.body;
    console.log("OrderId", orderID);

    if (!orderID) {
      throw new ApiError(400, "Missing order ID");
    }

    const accessToken = await getAccessToken();

    const captureResponse = await axios.post(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`, // ✅ Correct API endpoint
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    res.status(200).json(
      new ApiResponse(200, "Payment captured successfully", {
        captureData: captureResponse.data,
      }),
    );
  } catch (error) {
    console.error(
      "Error capturing payment:",
      error.response?.data || error.message,
    );
    throw new ApiError(500, "Error capturing payment");
  }
});

export { createOrder, captureOrder };