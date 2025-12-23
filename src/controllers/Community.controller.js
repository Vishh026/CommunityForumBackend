const Community = require("../models/community.model");
const { validateCommunityData } = require("../Utilities/ValidateData");
const mongoose = require("mongoose");
const communityRequest = require("../models/CommunityRequest.model");

async function fetchMyCommunities(req, res) {
  try {
    const userId = req.user._id;

    const myCommunities = await Community.find({
      members: userId,
      blockedUsers: { $nin: [userId] },
    }).select("-__v -blockedUsers");

    const requestedCommunities = await communityRequest
      .find({ fromUser: userId, status: "pending" })
      .populate({
        path: "requestedCommunity",
        select: "name isPrivate members createdBy image",
      });

      const filteredRequest = requestedCommunities.filter(req => 
        res.requestedCommunities && !res.requestedCommunities.blockedUsers(userId)
      )

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
    const adminId = req.user._id;

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
    const adminId = req.user._id;
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
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res.status(400).json({ message: "Invalid community id" });
    }

    const community = await Community.findOne({
      _id: communityId,
      blockedUsers: { $ne: [userId] },
      members: { $nin: [userId] },
    });

    if (!community) {
      return res.status(404).json({ message: "Access denied" });
    }
    const isMember = community.members.some((id) => id.equals(userId));

    if (isMember) {
      return res.status(400).json({ message: "Already member" });
    }

    if (!community.isPrivate) {
      await Community.updateOne(
        {
          _id: communityId,
          members: { $nin: [userId] },
        },
        {
          $addToSet: { members: userId },
        } //prevents duplicates
      );

      return res.status(201).json({ message: "join community successfully" });
    }

    const existingRequestTojoin = await communityRequest.findOne({
      requestedCommunity: communityId,
      fromUser: userId,
      status: "pending",
    });

    if (existingRequestTojoin) {
      return res.status(400).json({ message: "Request already sent" });
    }
    if (community.createdBy.equals(userId)) {
      return res.status(400).json({ message: "Admin unable to join" });
    }

    await communityRequest.create({
      requestedCommunity: communityId,
      fromUser: userId,
    });

    return res
      .status(200)
      .json({ message: "join request send successfully", status: "pending" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function updateRequestStatusController(req, res) {
  try {
    // /:communityId/:status/:requestId/

    const adminId = req.user._id;
    const { communityId, status, requestId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(communityId) ||
      !mongoose.Types.ObjectId.isValid(requestId)
    ) {
      return res.status(400).send("Invalid request");
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(400).send("community not found");
    }

    const allowedStatus = ["approved", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).send("Invalid status");
    }

    if (!community.createdBy.equals(adminId)) {
      return res.status(400).send("Only admin can access");
    }

    const requestCommunity = await communityRequest.findOne({
      _id: requestId,
      requestedCommunity: communityId,
    });

    if (!requestCommunity) {
      return res.status(400).send("Request not found");
    }

    if (requestCommunity.status !== "pending") {
      return res.status(403).json({ message: "Request alredy processed" });
    }

    if (status == "approved") {
      await Community.updateOne(
        { _id: communityId },
        { $addToSet: { members: requestCommunity.fromUser } }
      );
    }

    requestCommunity.status = status;
    await requestCommunity.save();

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
      return res.status(401).send("Inavlid community Id");
    }

    const community = await Community.findById(communityId);
    if (!community) return res.status(401).send("community not found");

    const isMember = community.members.some((id) => id.equals(userId));
    if (!isMember) {
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

    return res.status(200).json({ message: "Left community successfully" });

    // community ??
    // user is member??
    // amin can't leave own community?/

    res.send("success");
  } catch (err) {
    return res.status(400).json({ message: err.message });
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
