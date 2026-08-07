const router = require("express").Router();

const {
  getConversations,
  getConversationById,
  deleteConversation,
} = require("../controllers/conversation.controller");


// Sidebar list
router.get(
  "/",
  getConversations
);


// Open single chat
router.get(
  "/:id",
  getConversationById
);


// Delete conversation
router.delete(
  "/:id",
  deleteConversation
);


module.exports = router;