const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 20,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 20,
  },
  userName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 20,
    unique: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid E-Mail");
      }
    },
  },
  gender: {
    type: String,
    validate(value) {
      if (!["male", "female", "other"].includes(value)) {
        throw new Error("Gender can be invalid");
      }
    },
  },
  password: {
    type: String,
    required: true,
  },
  avtar: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error("Invalid Url");
      }
    },
  },
  experience: {
    type: Number,
    min: 0,
  },
  githubUrl: {
    type: String,
  },
  linkedinUrl: {
    type: String,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  headline: {
    type: String,
    minLength:100
  },
  bio: {
    type: String,
    default: "write your bio briefly",
    maxlength: 200,
  },
  skills: {
    type: [String],
  }
},{
  timestamps:true
}
);

const User = mongoose.model("User", userSchema);

module.exports = User;
