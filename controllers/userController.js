const User = require("../model/userModel");
var fs = require("fs");
var path = require("path");
const multer = require("multer");
const sharp = require("sharp");

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
};
// Store in diskstorage
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users"
//     );
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      res.status(400).json({
        status: "success",
        message: "Not an image",
      }),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  await sharp(req.file.buffer)
    .resize(100, 100)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer()
    .then(function(outbuff) {
      req.file.buffer = outbuff;
      console.log("resize function", req.file);
    });

  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getAllUsers = async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    result: users.length,
    data: {
      users,
    },
  });
};

exports.getImg = async (req, res, next) => {
  const users = await User.findById(req.user.id);

  res.status(200).json({
    status: "success",
    result: users.length,
    data: {
      users,
    },
  });
};

exports.updateMe = async (req, res, next) => {
  // 1)Create error if user update password
  if (req.body.password || req.body.passwordConfirm) {
    res.status(400).json({
      status: "fail",
      message:
        "Cannot update password from this route please use /updateMyPassword",
    });
  }
  // 2)Update docs
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) {
    console.log("Now here in update me", req.file);
    filteredBody.img = {
      data: req.file.buffer,
      contentType: "image/png",
    };
  }
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidator: true,
  });
  req.user = updatedUser;
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
};

exports.deleteMe = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
};
