const express = require("express");
const axios = require("axios");
const { Client } = require("pg"); // PostgreSQL client
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ extended: false }));

// PostgreSQL client setup
const client = new Client("postgresql://Tachyon24_owner:vgUcj4XYz6ub@ep-little-firefly-a5c2b4r2.us-east-2.aws.neon.tech/Tachyon24?sslmode=require");

client.connect();

// Create table if it does not exist
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_creation_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        razorpay_order_id VARCHAR(255),
        razorpay_signature VARCHAR(255),
        user_name VARCHAR(255),
        user_email VARCHAR(255),
        user_contact VARCHAR(255),
        user_location TEXT,
        selected_size VARCHAR(50),
        payment_status VARCHAR(50) DEFAULT 'Success'
    );
`;

client.query(createTableQuery)
    .then(() => {
        console.log("Payments table checked/created successfully.");
    })
    .catch((error) => {
        console.error("Error creating payments table:", error);
    });

// Routes
app.use("/payment", require("./payment/payment"));

// Route to handle payment data submission to database
app.post('/send-to-db', async (req, res) => {
    const { orderCreationId, razorpayPaymentId, razorpayOrderId, razorpaySignature, userInfo, selectedSize } = req.body;

    const query = `
        INSERT INTO payments(
            order_creation_id, razorpay_payment_id, razorpay_order_id, razorpay_signature,
            user_name, user_email, user_contact, user_location, selected_size, payment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    const values = [
        orderCreationId,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
        userInfo.name,
        userInfo.email,
        userInfo.contact,
        userInfo.location,
        selectedSize,
        "Success", // assuming successful payment, you can change this to dynamic status if needed
    ];

    try {
        await client.query(query, values);
        res.json({ msg: "Payment data saved successfully!" });
    } catch (error) {
        console.error("Error saving payment data:", error);
        res.status(500).json({ msg: "Error saving payment data", error: error.message });
    }
});

// Start server
app.listen(port, () => console.log(`Server started on port ${port}`));
