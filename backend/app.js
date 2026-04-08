const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});

// AI ROUTE
app.post("/api/ai/advice", async (req, res) => {
  const { weight, height, bmi } = req.body;

  try {
    const axios = require("axios");

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Tôi nặng ${weight}kg, cao ${height}cm, BMI ${bmi}. Hãy cho lời khuyên sức khỏe ngắn gọn.`,
              },
            ],
          },
        ],
      }
    );

    const advice =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Không có phản hồi";

    res.json({ advice });

  } catch (err) {
    console.log("AI ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "AI error" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});