const crypto = require("crypto");
const { promisify } = require("util");
const User = require("../model/userModel");
const sendEmail = require("../utils/email");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (req, res, next) => {
  const newUser = await User.create({
    fullName: req.body.fullName,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = signToken(newUser._id);
  res.cookie("jwt", token, { httpOnly: false, secure: false });
  return res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
};

exports.login = async (req, res, next) => {
  const Identity = req.body.Identity;
  const password = req.body.password;
  if (!Identity || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide email and password",
    });
  }
  let user = await User.findOne({ email: Identity }).select("+password");

  if (!user) {
    user = await User.findOne({ username: Identity }).select("+password");
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    res.cookie("jwt", undefined, { httpOnly: false, secure: false });
    return res.status(401).json({
      status: "fail",
      message: "Incorrect email and password",
    });
  }
  const token = signToken(user._id);
  req.user = user;
  res.cookie("jwt", token, { httpOnly: false, secure: false });
  return res.status(200).json({
    status: "success",
    token,
  });
};

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.cookie) {
    token = req.headers.cookie.split("jwt=")[1];
  }

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "You are not loged in please login",
    });
  }

  //2)Verfication token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3)Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res.status(401).json({
      status: "fail",
      message: "No user exists",
    });
  }

  //4)Check if user changed password after jwt is issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return res.status(401).json({
      status: "fail",
      message: "Password Changed after token issued",
    });
  }

  req.user = currentUser;
  next();
};

exports.restrictTo = function(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: "fail",
        message: "You do not have permission",
      });
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  // 1)Get user based on post email
  const user = await User.findOne({ email: req.body.email });
  console.log(user)
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "User doesnt exists",
    });
  }
  // 2)Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3)Send it to the user
  const message = `Forgot your password? Reset your password with token: ${resetToken}, If not than ignore`;
  console.log(user.email);
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token is valid for 20mins",
      message,
    });
    return res.status(200).json({
      status: "success",
      message: "Token send to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({
      status: "fail",
      message: `There was error sending email try again later ${err}`,
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  // 1)Get user based on user
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;
  console.log(password, passwordConfirm);
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2)If token as not expired and user is there than set new password
  if (!user) {
    return res.status(400).json({
      status: "fail",
      message: "Token is invalid or expired",
    });
  }

  // 3)Update changed password porperty for user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4)Log the user and send jwt
  const token = signToken(user._id);

  return res.status(200).json({
    status: "success",
    token,
  });
};

exports.updatePassword = async (req, res, next) => {
  //1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  //2)Check if entered current pass is currect

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    res.status(200).json({
      status: "success",
      message: "Password entered is incorrect",
    });
  }

  //3)Update pass
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordChangedAt = Date.now();
  await user.save();

  //4)sent jwt and logged in
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
};

// "password":"newPass123"
// "password":"pass1234"
