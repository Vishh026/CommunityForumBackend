const mongoose = require("mongoose");
const validator = require("validator");

const CommunityRequestsSchema = new mongoose.Schema(
  {
    requestedCommunity: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Community",
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestType: {
      type: String,
      enum: ["join"],
      default : "join",
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const communityRequest = mongoose.model("CommunityRequests", CommunityRequestsSchema);

module.exports = communityRequest;
