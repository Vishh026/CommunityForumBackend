const mongoose = require("mongoose");
const validator = require("validator");

// firstName,lastName,userName,gender,password,email,profileURL,githubUrl,linkedinUrl,role,headline,bio skills,publicVisibility,isActive

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
  profileURL: {
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
    enum: ["ADMIN", "USER"],
    default: "user",
  },
  bio: {
    type: String,
    default: "write your bio briefly",
    maxlength: 200,
  },
  skills: {
    type: [String],
  },
  publicVisibility: {
    type: String,
    enum: ["PUBLIC","PRIVATE"],
    default: "PUBLIC"
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  
  adminType: {
    type: String,
    enum: ["COLLEGE", "UNIVERSITY", "PLACEMENT"],
    default: null
    // required ONLY if role === "ADMIN" (handle via validation/middleware)
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  batchYear: {
    type: Number,
    required: true,
    min: 2000,
    max: 2100
  },
  isVerified: {
    type: Boolean,
    default: false
  }
},{
  timestamps:true
}
);

const User = mongoose.model("User", userSchema);

module.exports = User;
