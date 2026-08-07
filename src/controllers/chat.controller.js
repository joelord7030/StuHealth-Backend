const prisma = require("../lib/prisma");
const { extractDocxText } = require("../services/docx.service");
const { streamResponse } = require("../services/groq.service");
const { extractPdfText } = require("../services/pdf.service");
const crypto = require("crypto");

exports.sendMessage = async (req, res) => {
  const {
    conversationId,
    message,
    model,
    file,
  } = req.body;

  console.log("========== NEW REQUEST ==========");
  console.log("Conversation:", conversationId);
  console.log("Message:", message);
  console.log("File:", file);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    let activeConversationId = conversationId;

    // Create conversation
    if (!activeConversationId) {
      const conversation = await prisma.conversation.create({
        data: {
          title:
            message?.slice(0, 40) ||
            file?.filename ||
            "Untitled",

          model:
            model ||
            "llama-3.3-70b-versatile",
        },
      });

      activeConversationId = conversation.id;
    }


    let userPrompt = message || "";


    // Handle PDF
    if (
      file &&
      file.mimetype === "application/pdf"
    ) {
      try {
        console.log("Extracting PDF:", file.path);

        const pdfText = await extractPdfText(
          file.path
        );

        console.log(
          "PDF characters:",
          pdfText.length
        );


        userPrompt = `
You are StuHealth AI.

Answer the user's question using the uploaded document.

DOCUMENT:
----------------

${pdfText}

----------------

USER QUESTION:
${message}
`;
      } catch (error) {
        console.error(
          "PDF extraction error:",
          error
        );
      }
    }

    else if (
  file &&
  file.mimetype ===
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
) {

  try {

    console.log(
      "Extracting Word:",
      file.path
    );

    const docText =
  await extractDocxText(file.path);

console.log(
  "DOCX characters:",
  docText.length
);

console.log(
  "DOCX preview:",
  docText.substring(0, 500)
);

    userPrompt = `
You are StuHealth AI.

Answer using this Word document.

DOCUMENT:
----------------

${docText}

----------------

USER QUESTION:

${message}
`;

  } catch(error){

    console.error(
      "DOCX extraction failed:",
      error
    );

  }

}

    // Prevent empty messages
    if (!userPrompt.trim()) {
      userPrompt =
        "Please analyze the uploaded document.";
    }


    // Save user message
    await prisma.message.create({
      data: {
        conversationId:
          activeConversationId,

        role: "user",

        content: userPrompt,

        status: "completed",

        fileName:
          file?.filename || null,

        filePath:
          file?.path || null,

        fileType:
          file?.mimetype || null,

        fileSize:
          file?.size || null,
      },
    });



    const assistantMessageId =
      crypto.randomUUID();


    // Assistant placeholder
    await prisma.message.create({
      data: {
        id: assistantMessageId,

        conversationId:
          activeConversationId,

        role: "assistant",

        content: "",

        status: "streaming",
      },
    });



    res.write(
      `data: ${JSON.stringify({
        type: "start",
        conversationId:
          activeConversationId,
        assistantMessageId,
      })}\n\n`
    );


    res.flush?.();



    // Load history
    const history =
      await prisma.message.findMany({
        where: {
          conversationId:
            activeConversationId,
        },

        orderBy: {
          createdAt: "asc",
        },
      });



    let messages =
      history
        .filter(
          (msg) =>
            msg.content &&
            msg.content.trim()
        )
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));


    console.log(
      "FINAL AI MESSAGES:",
      messages
    );



    // Safety fallback
    if (messages.length === 0) {
      messages = [
        {
          role: "user",
          content:
            message ||
            "Analyze this document.",
        },
      ];
    }



    let fullResponse = "";



    await streamResponse({
      messages,

      model:
        model ||
        "llama-3.3-70b-versatile",


      onToken(token) {
        fullResponse += token;


        res.write(
          `data: ${JSON.stringify({
            type: "token",
            token,
          })}\n\n`
        );


        res.flush?.();
      },
    });



    await prisma.message.update({
      where: {
        id: assistantMessageId,
      },

      data: {
        content: fullResponse,

        status: "completed",
      },
    });



    res.write(
      `data: ${JSON.stringify({
        type: "done",
        conversationId:
          activeConversationId,
      })}\n\n`
    );


    res.flush?.();

    res.end();



  } catch (error) {

    console.error(
      "Chat Controller Error:",
      error
    );


    res.write(
      `data: ${JSON.stringify({
        type: "error",

        message:
          error.message ||
          "Server error",
      })}\n\n`
    );


    res.flush?.();

    res.end();
  }
};