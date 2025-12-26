const Community = require("../models/community.model");
const { validateCommunityData } = require("../Utilities/ValidateData");
const mongoose = require("mongoose");
const communityRequest = require("../models/CommunityRequest.model");
const { logAction } = require("../Utilities/logAction");

async function fetchMyCommunities(req, res) {
  try {
    const userId = req.user._id;

    const myCommunities = await Community.find({
      members: userId,
      blockedUsers: { $nin: [userId] },
    }).select("-__v -blockedUsers");

    const requestedCommunities = await communityRequest
      .find({ fromUser: userId, status: "PENDING" })
      .populate({
        path: "requestedCommunity",
        select: "name isPrivate members createdBy image",
      });

    const filteredRequest = requestedCommunities.filter(
      (req) =>
        res.requestedCommunities &&
        !res.requestedCommunities.blockedUsers(userId)
    );

    if (!myCommunities.length && !requestedCommunities.length)
      return res.status(404).json({ message: "No communities found" });

    res.status(200).json({
      message: "Fetched communities successfully",
      joinedCommunities: myCommunities,
      pendingRequests: filteredRequest,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function fetechAllCommunities(req, res) {
  try {
    const userId = req.user._id;

    const communities = await Community.find({
      blockedUsers: { $nin: [userId] },
      $or: [
        { isPrivate: false },
        { isPrivate: true, members: userId, createdBy: userId },
      ],
    }).select("-blockedUsers -__v");

    if (communities.length === 0)
      return res.status(401).send("Communities not found");

    res
      .status(201)
      .json({ message: "Community fetch successfully", communities });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function createCommunityController(req, res) {
  try {
    const { _id: adminId, role: adminRole } = req.user;

    if (adminRole !== "ADMIN") {
      return res.status(403).json({ message: "Only admins can create communities" });
    }

    const { name, description, headline, image, rules, isPrivate, members } =
      req.body;

    validateCommunityData(req.body);

    const normalizedName = name.trim().toLowerCase();

    if (!normalizedName) {
      return res.status(400).json({
        message: "Community name cannot be empty",
      });
    }

    const existingCommunity = await Community.findOne({
      name: normalizedName,
    });

    if (existingCommunity)
      return res.status(409).status("coomunity with this name alredy exits");

    const newCommunity = new Community({
      name: normalizedName,
      description,
      headline,
      image,
      rules,
      isPrivate: isPrivate ?? false,
      createdBy: adminId,
      members: [adminId],
    });

    await logAction({
      actorId: adminId,
      actorRole: adminRole,
      action: "COMMUNITY_CREATED",
      entityType: "COMMUNITY",
      entityId: newCommunity._id,
      metadata: {
        ip: req.ip,
        userAgent: req.headers["user-agent"], 
      },
    });

    await newCommunity.save();

    res
      .status(201)
      .json({ message: "Community created successfully", newCommunity });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function editCommunityController(req, res) {
  try {
     const { _id: adminId, role: adminRole } = req.user;
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community)
      return res.status(401).json({ message: "community not found" });

    if (adminId.toString() !== community.createdBy.toString())
      return res.status(401).json({ message: "Invalid Access" });

    const allowedUpdates = [
      "name",
      "headline",
      "bio",
      "image",
      ,
      "description",
      "isPrivate",
    ];

    const validateUpdate = Object.keys(req.body).every((val) =>
      allowedUpdates.includes(val)
    );
    if (!validateUpdate) res.status(401).json("Invalid updates");

    Object.keys(req.body).forEach((val) => (community[val] = req.body[val]));

    await logAction({
      actorId: adminId,
      actorRole: adminRole,
      action: "COMMUNITY_EDITED",
      entityType: "COMMUNITY",
      entityId: community._id,
      metadata: {
        ip: req.ip,
        userAgent: req.headers["user-agent"], 
      },
    });

    await community.save();

    res.status(201).json({
      mesage: "Community edited successfully",
      community,
    });
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
}

async function fetchCommunityByIdController(req, res) {
  try {
    const communityId = req.params.communityId;

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res.status(400).json({ message: "invalid community " });
    }

    const community = await Community.findOne({
      _id: communityId,
      // you are not in communities blocked user
      blockedUsers: { $nin: [req.user._id] },
      // is Community private?? or if you are member then only give access
      $or: [{ isPrivate: false }, { members: req.user._id }],
    }).select("-__v");

    if (!community)
      return res.status(404).json({ message: "Error in finding community" });

    res
      .status(200)
      .json({ message: "Fecth community successfully", community });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function joinCommunityController(req, res) {
  try {
    const { communityId } = req.params;
    const { _id: userId, role: userRole } = req.user;

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res.status(400).json({ message: "Invalid community id" });
    }

    const community = await Community.findOne({
      _id: communityId,
      blockedUsers: { $nin: [userId] },
    });

    if (!community) {
      return res.status(404).json({ message: "Community not found or access denied" });
    }

    // Admin cannot join their own community
    if (community.createdBy.equals(userId)) {
      return res.status(403).json({ message: "Admin cannot join their own community" });
    }

    // Already a member
    if (community.members.some((id) => id.equals(userId))) {
      return res.status(400).json({ message: "Already a member" });
    }

    let actionType;

    if (!community.isPrivate) {
      // Public community → join immediately
      await Community.updateOne(
        { _id: communityId, members: { $nin: [userId] } },
        { $addToSet: { members: userId } }
      );
      actionType = "JOIN_COMMUNITY";

      resStatus = 201;
      resMessage = "Joined community successfully";
    } else {
      // Private community → send join request
      const existingRequest = await communityRequest.findOne({
        requestedCommunity: communityId,
        fromUser: userId,
        status: "PENDING",
      });

      if (existingRequest) {
        return res.status(400).json({ message: "Join request already sent" });
      }

      await communityRequest.create({
        requestedCommunity: communityId,
        fromUser: userId,
      });
      actionType = "JOIN_REQUEST_SENT";

      resStatus = 200;
      resMessage = "Join request sent successfully";
    }

    // Single audit log
    await logAction({
      actorId: userId,
      actorRole: userRole,
      action: actionType,
      entityType: "COMMUNITY",
      entityId: communityId,
      metadata: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    return res.status(resStatus).json({ message: resMessage });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function updateRequestStatusController(req, res) {
  try {
    const adminId = req.user._id;
    const { communityId, status, requestId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(communityId) ||
      !mongoose.Types.ObjectId.isValid(requestId)
    ) {
      return res.status(400).send("Invalid request");
    }

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).send("Community not found");

    if (!community.createdBy.equals(adminId)) {
      return res.status(403).send("Only admin can update requests");
    }

    const allowedStatus = ["APPROVED", "REJECTED"];
    if (!allowedStatus.includes(status.toLowerCase())) {
      return res.status(400).send("Invalid status");
    }

    const requestCommunity = await communityRequest.findOne({
      _id: requestId,
      requestedCommunity: communityId,
    });

    if (!requestCommunity) {
      return res.status(404).send("Request not found");
    }

    if (requestCommunity.status !== "PENDING") {
      return res.status(403).json({ message: "Request already processed" });
    }

    if (status.toLowerCase() === "APPROVED") {
      await Community.updateOne(
        { _id: communityId },
        { $addToSet: { members: requestCommunity.fromUser } }
      );
    }

    requestCommunity.status = status.toLowerCase();
    await requestCommunity.save();

   
    await logAction({
      actorId: adminId,
      actorRole: "ADMIN",
      action: status.toLowerCase() === "APPROVED" ? "REQUEST_APPROVED" : "REQUEST_REJECTED",
      entityType: "COMMUNITY_REQUEST",
      entityId: requestId,
      metadata: {
        communityId,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    return res.status(200).json({
      message: `Request ${status.toLowerCase()} successfully`,
      requestCommunity,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function leaveCommunityController(req, res) {
  try {
    const userId = req.user._id;
    const { communityId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res.status(400).send("Invalid community Id");
    }

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).send("Community not found");

    if (!community.members.some((id) => id.equals(userId))) {
      return res.status(400).json({ message: "You are not a member" });
    }

    if (community.createdBy.equals(userId)) {
      return res
        .status(403)
        .json({ message: "Admin cannot leave their own community" });
    }

    await Community.updateOne(
      { _id: communityId },
      { $pull: { members: userId } }
    );

    // Audit log
    await logAction({
      actorId: userId,
      actorRole: req.user.role,
      action: "COMMUNITY_DELETED",
      entityType: "COMMUNITY",
      entityId: communityId,
      metadata: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    return res.status(200).json({ message: "Left community successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}



module.exports = {
  fetchMyCommunities,
  fetechAllCommunities,
  createCommunityController,
  editCommunityController,
  fetchCommunityByIdController,
  joinCommunityController,
  updateRequestStatusController,
  leaveCommunityController,
};

// try{

// res.status(201).send("success")
// }catch(err){
//     return res.status(400).json({message: err.message})
// }
