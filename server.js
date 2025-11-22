import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 💬 MoneyMap Chat Route
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are MoneyMap AI — a friendly, smart financial assistant.
          You ONLY answer questions related to the MoneyMap app, budgeting, personal finance,
          expense tracking, savings goals, or app usage.
          If someone asks something unrelated (like history, weather, or random topics),
          reply politely: "I'm your MoneyMap Assistant — I can only help with budgeting or financial topics."`,
        },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "AI failed to respond" });
  }
});

app.listen(5000, () =>
  console.log("✅ Server running on http://localhost:5000")
);
