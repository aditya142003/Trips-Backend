const express = require("express");
const postController = require("../controllers/postController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);
router
  .route("/")
  .get(postController.getAllposts)
  .post(postController.createpost);

router
  .route("/:id")
  .get(postController.getpost)
  .patch(postController.updatepost)
  .delete(
    authController.restrictTo("admin", "lead-guide"),
    postController.deletepost
  );

router.all("*", (req, res, next) => {
  res.end("404 ERROR PAGE");
});

module.exports = router;
