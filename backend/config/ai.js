const OpenAI = require("openai");

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
        return "Sorry, I couldn't respond right now.";
    }
}

module.exports = { getAIReply };