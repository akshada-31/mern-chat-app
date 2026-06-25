const OpenAI = require("openai");

if (!process.env.OPENAI_API_KEY) {
    console.warn("⚠️ OPENAI_API_KEY is not set");
}

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function getAIReply(message) {
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a helpful assistant inside a chat app. Keep replies short and natural.",
                },
                {
                    role: "user",
                    content: message,
                },
            ],
        });

        return response.choices[0].message.content;
    } catch (err) {
        console.error("AI error:", err);
        if (err.status === 429) {
            return "⚠️ AI service is temporarily unavailable (quota exceeded).";
        }
        return "Sorry, I couldn't respond right now.";
    }
}

module.exports = { getAIReply };