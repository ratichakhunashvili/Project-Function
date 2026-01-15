const express = require("express");
const cors = require("cors");
require("dotenv").config();

const twilio = require("twilio");

const app = express();
app.use(cors());
app.use(express.json());

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

app.post("/send-sms", async (req, res) => {
  const { numbers, message } = req.body;

  try {
    for (let number of numbers) {
      try {
        const formatted = formatGeorgianNumber(number);
        console.log("Sending to:", formatted);
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE,
          to: formatted,
        });
      } catch (err) {
        console.error("Error sending to", number, "->", err.message);
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
