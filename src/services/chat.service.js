const prisma = require("../lib/prisma");
const {
  generateResponse,
} = require("./groq.service");

async function processChat({
  conversationId,
  message,
}) {
  let activeConversationId = conversationId;

  // Create conversation if needed
  if (!activeConversationId) {
    const conversation =
      await prisma.conversation.create({
        data: {
          title:
            message.length > 40
              ? message.slice(0, 40)
              : message,

          model: "GPT-5.5",
        },
      });

    activeConversationId =
      conversation.id;
  }

  // Save user message
  const userMessage =
    await prisma.message.create({
      data: {
        conversationId:
          activeConversationId,

        role: "user",

        content: message,
      },
    });

  // Generate AI response
  const aiResponse =
    await generateResponse(message);

  // Save assistant message
  const assistantMessage =
    await prisma.message.create({
      data: {
        conversationId:
          activeConversationId,

        role: "assistant",

        content: aiResponse,
      },
    });

  return {
    conversationId:
      activeConversationId,

    userMessage,

    assistantMessage,
  };
}

module.exports = {
  processChat,
};