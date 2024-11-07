const express = require("express");

const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());

// middlewares
app.use(express.json({ extended: false }));

// route included
app.use("/payment", require("./payment/payment"));

app.listen(port, () => console.log(`server started on port ${port}`))