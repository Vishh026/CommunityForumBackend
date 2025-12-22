const mongoose = require("mongoose");
const validator = require("validator");

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, 
  minlength: 3, 
  maxlength: 50 
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  headline: {
    type: String,
    required: true,
    maxLength: 200,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error("Invalid Url");
      }
    },
  },
  rules: [
    {
      type: String,
    },
  ],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  members: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  maxMembers: {
    type: Number,
    default: null,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Community = mongoose.model("Community", communitySchema);

module.exports = Community;
