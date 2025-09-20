/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const axios = require("axios");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Get Gemini API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Gemini AI Sentiment Analysis Function
exports.analyzeSentimentWithGemini = onCall(
  { maxInstances: 5 }, // Cost control for this specific function
  async (request) => {
    const { text, mood } = request.data;
    
    // Check if user is authenticated
    if (!request.auth) {
      logger.warn("Unauthenticated request to analyzeSentimentWithGemini");
      throw new Error("User not authenticated");
    }

    logger.info("Processing sentiment analysis", { 
      userId: request.auth.uid, 
      mood: mood,
      textLength: text.length 
    });

    const prompt = `
      Analyze this journal entry and provide supportive feedback for a youth mental wellness app.
      User selected mood: ${mood}
      Journal text: "${text}"
      
      Respond with empathetic, supportive feedback in 1-2 sentences. Be encouraging and understanding.
    `;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        }
      );

      const aiResponse = response.data.candidates[0].content.parts[0].text.trim();
      
      logger.info("Successfully generated AI response", { 
        userId: request.auth.uid,
        responseLength: aiResponse.length 
      });

      return { 
        aiResponse, 
        sentiment: mood,
        success: true 
      };

    } catch (error) {
      logger.error("Gemini API Error", { 
        error: error.message,
        userId: request.auth.uid 
      });
      throw new Error("AI analysis failed. Please try again.");
    }
  }
);

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
