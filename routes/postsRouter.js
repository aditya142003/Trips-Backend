const express = require("express");
const postController = require("../controllers/postController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.protect, postController.getAllposts)
  .post(postController.createpost);

router
  .route("/:id")
  .get(postController.getpost)
  .patch(postController.updatepost)
  .delete(postController.deletepost);

module.exports = router;
