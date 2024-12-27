const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    isName: {
      type: String,
      required: true,
    },
    isUsername: {
      type: String,
      required: true,
    },
    isEmail: {
      type: String,
      required: true,
    },
    isPassword: {
      type: String,
      required: true,
    },
    isToken: {
      type: String,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },
    resetPasswordVerificationCode: {
      type: String,
      default: null,
    },
    resetcodeExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", userSchema);
