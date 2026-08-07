require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,

  OPENAI_KEY:
    process.env.OPENAI_KEY,

  DATABASE_URL:
    process.env.DATABASE_URL,
};