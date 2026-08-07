const router = require("express").Router();

const {
  sendMessage,
} = require("../controllers/chat.controller");


router.post(
  "/",
  sendMessage
);


module.exports = router;