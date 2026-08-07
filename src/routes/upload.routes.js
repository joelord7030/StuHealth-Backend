const router = require("express").Router();

const {
  upload,
  uploadFile,
} = require("../controllers/upload.controller");

router.post(
  "/",
  upload,
  uploadFile
);

module.exports = router;