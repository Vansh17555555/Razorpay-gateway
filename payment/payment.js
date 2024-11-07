require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();

// Endpoint to create a new Razorpay order
router.post("/orders", async (req, res) => {
    try {
        const { amount, currency, receipt } = req.body;

        // Check if required parameters are present
        if (!amount || !currency || !receipt) {
            return res.status(400).json({ error: "Amount, currency, and receipt are required" });
        }

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const options = {
            amount: amount , // Convert amount to the smallest currency unit
            currency,
            receipt,
        };

        const order = await instance.orders.create(options);

        if (!order) {
            return res.status(500).json({ error: "Order creation failed" });
        }

        res.json(order);
    } catch (error) {
        console.error("Order creation error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint to verify payment success
router.post("/success", async (req, res) => {
    try {
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body;

        const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
        const digest = shasum.digest("hex");

        if (digest !== razorpaySignature) {
            return res.status(400).json({ error: "Invalid transaction signature" });
        }

        res.json({
            message: "Payment verified successfully",
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
