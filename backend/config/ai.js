const OpenAI = require("openai");

if (!process.env.OPENAI_API_KEY) {
    console.warn("⚠️ OPENAI_API_KEY is not set");
}

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
async function getAIReply(message) {
    return "AI is working: " + message;
}

module.exports = { getAIReply };