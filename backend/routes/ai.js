const express = require("express");
const db = require("../config/mysql");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/chat", protect, async (req, res) => {
  try {
    const message = req.body?.message;

    // Validate message
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message must be under 2000 characters.",
      });
    }

    // Check Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing from backend/.env");

      return res.status(500).json({
        success: false,
        message: "Gemini API key is not configured.",
      });
    }

    // Fetch the logged-in user's fitness profile
    const [users] = await db.promise().query(
      `SELECT name, age, height, weight, gender, goal,
              activityLevel, foodPreference
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = users[0];

    // Initialize Gemini
    const { GoogleGenAI } = await import("@google/genai");

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Build the personalized prompt
    const prompt = `
You are the AI Fitness Coach in a fitness tracking application.

USER FITNESS PROFILE:
${JSON.stringify(user)}

USER MESSAGE:
${message.trim()}

INSTRUCTIONS:
- Give friendly, practical and concise fitness, workout and nutrition guidance.
- Personalize recommendations using the user's profile when relevant.
- Do not invent nutrition facts or claim estimates are exact.
- Ask a short follow-up question if important information is missing.
- Do not diagnose diseases or prescribe medication.
- Never recommend crash diets, extreme calorie restriction or unsafe
  supplement use.
- Explain when the user should seek qualified medical advice.
- Format answers clearly with short paragraphs or bullet points.
- If a profile field is missing, do not assume its value.
`;

    // Generate response with retries for temporary failures
    const model =
      process.env.GEMINI_MODEL || "gemini-3.8-flash";

    let result;
    let lastError;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        break;
      } catch (error) {
        lastError = error;

        const status = Number(
          error.status ||
          error.statusCode ||
          error.code ||
          error.error?.code
        );

        const retryableStatuses = [
          429, 500, 502, 503, 504,
        ];

        if (
          !retryableStatuses.includes(status) ||
          attempt === 2
        ) {
          throw error;
        }

        // Exponential backoff
        const delay =
          1000 * 2 ** attempt + Math.random() * 500;

        console.warn(
          `Gemini request failed (HTTP ${status}). ` +
          `Retrying in ${Math.round(delay)} ms ` +
          `(attempt ${attempt + 1}/3)...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, delay)
        );
      }
    }

    if (!result) {
      throw lastError || new Error(
        "Gemini did not return a result."
      );
    }

    const reply = result.text;

    if (!reply || !reply.trim()) {
      return res.status(502).json({
        success: false,
        message:
          "Gemini returned an empty response. Please try again.",
      });
    }

    return res.json({
      success: true,
      reply: reply.trim(),
    });
  } catch (error) {
    console.error(
      "GEMINI AI COACH ERROR:",
      error.message || error
    );

    const status = Number(
      error.status ||
      error.statusCode ||
      error.code ||
      error.error?.code
    );

    if (status === 429) {
      return res.status(429).json({
        success: false,
        message:
          "Gemini rate limit or quota reached. Check your API quota and try again later.",
      });
    }

    if (status === 401 || status === 403) {
      return res.status(502).json({
        success: false,
        message:
          "Gemini authentication failed. Check your GEMINI_API_KEY and API access.",
      });
    }

    if (status === 503 || status === 504) {
      return res.status(503).json({
        success: false,
        message:
          "Gemini is experiencing high demand. Please wait a moment and try again.",
      });
    }

    if (status === 404) {
      return res.status(502).json({
        success: false,
        message:
          "The configured Gemini model was not found or is unavailable. Check GEMINI_MODEL in backend/.env.",
      });
    }

    return res.status(502).json({
      success: false,
      message:
        "The AI Coach is temporarily unavailable. Check the backend terminal for details.",
    });
  }
});

module.exports = router;