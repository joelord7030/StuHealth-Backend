const Groq = require("groq-sdk");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function streamResponse({
  messages,
  model = "llama-3.3-70b-versatile",
  onToken,
}) {
  const stream = await client.chat.completions.create({
    model,

    messages,

    temperature: 0.7,

    stream: true,
  });

  let fullResponse = "";

  for await (const chunk of stream) {
    const token =
      chunk.choices?.[0]?.delta?.content ?? "";

    if (!token) continue;

    fullResponse += token;

    onToken(token);
  }

  return fullResponse;
}

module.exports = {
  streamResponse,
};