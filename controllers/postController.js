const post = require("../model/postModel");
// const multer = require("multer");

// const upload = multer({ dest: "public/img/posts" });
// exports.uploadUserPhoto = upload.single("photo");

exports.getAllposts = async (req, res) => {
  try {
    const posts = await post.find();
  
    return res.status(200).json({
      status: "success",
      results: posts.length,
      data: {
        posts,
      },
    });
  } catch (err) {
    return res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.createpost = async (req, res) => {
  try {
    console.log(req.file);
    console.log(req.body);

    const newpost = await post.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        posts: newpost,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getpost = async (req, res) => {
  try {
    console.log(req.params.id)
    const onePost = await post.findById(req.params.id);
    console.log(onePost)

    return res.status(200).json({
      status: "success",
      data: {
        onePost,
      },
    });
  } catch (err) {
    return res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.updatepost = async (req, res) => {
  try {
    const updatedpost = await post.findByIdAndUpdate(req.params.id, req.body);

    res.status(204).json({
      status: "success",
      data: {
        updatedpost,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.deletepost = async (req, res) => {
  try {
    await post.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
