const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

//name, email,photo,password,passwordconfirm

const userSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Name is required"],
  },
  username: {
    type: String,
    unique: true,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Provide Valid email"],
  },
  img: {
    data: Buffer,
    contentType: String,
  },
  role: {
    type: String,
    enum: ["user", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Confirm Password is required"],
    validate: {
      //Only works on create() or save()
      validator: function(el) {
        return el === this.password;
      },
      message: "Password are not same",
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre(
  [
    "find",
    "findOneAndUpdate",
    "findOneAndUpdate",
    "findOneAndReplace",
    "findOneAndRemove",
    "findByIdAndDelete",
    "findByIdAndRemove",
    "findById",
  ],
  function(next) {
    this.find({ active: { $ne: false } });
    next();
  }
);

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 20 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
