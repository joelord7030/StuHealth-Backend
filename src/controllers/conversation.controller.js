const prisma = require("../lib/prisma");


// Get conversation list for sidebar
exports.getConversations = async (req, res) => {
  try {

    const conversations =
      await prisma.conversation.findMany({

        orderBy: {
          updatedAt: "desc",
        },

        select: {
          id: true,
          title: true,
          model: true,
          createdAt: true,
          updatedAt: true,
        },

      });


    res.json(conversations);


  } catch(error){

    console.error(
      "Conversation fetch error:",
      error
    );


    res.status(500).json({
      message:
        "Failed to fetch conversations"
    });

  }
};




// Get single conversation with messages
exports.getConversationById = async (
  req,
  res
) => {

  try {

    const { id } = req.params;


    const conversation =
      await prisma.conversation.findUnique({

        where:{
          id,
        },

        include:{
          messages:{
            orderBy:{
              createdAt:"asc",
            },
          },
        },

      });


    if(!conversation){

      return res.status(404).json({
        message:
          "Conversation not found"
      });

    }


    res.json(conversation);


  } catch(error){

    console.error(
      "Single conversation error:",
      error
    );


    res.status(500).json({
      message:
        "Failed to fetch conversation"
    });

  }

};




// Delete conversation
exports.deleteConversation = async (
  req,
  res
) => {

  try {

    const { id } = req.params;


    const conversation =
      await prisma.conversation.findUnique({

        where:{
          id,
        },

      });



    if(!conversation){

      return res.status(404).json({
        message:
          "Conversation not found",
      });

    }



    // Delete all messages belonging to conversation
    await prisma.message.deleteMany({

      where:{
        conversationId:id,
      },

    });



    // Delete conversation
    await prisma.conversation.delete({

      where:{
        id,
      },

    });



    res.json({

      message:
        "Conversation deleted successfully",

    });



  } catch(error){

    console.error(
      "Delete conversation error:",
      error
    );


    res.status(500).json({

      message:
        "Failed to delete conversation",

    });

  }

};