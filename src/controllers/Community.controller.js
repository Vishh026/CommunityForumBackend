const Community = require("../models/community.model");
const { validateCommunityData } = require("../Utilities/ValidateData");

async function createCommunityController(req, res) {
  try {
    const adminId = req.user._id;

    const { name, description, headline, image, rules, isPrivate, members } =
      req.body;

    const validationErrors = validateCommunityData(req.body);
    if (validationErrors) {
      return res.status(400).json({
        message: "Valiadtion failed",
        errors: validationErrors,
      });
    }

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
    const adminId = req.user._id
    const communityId = req.params.id;
    
    const community = await Community.findById(communityId);
    if (!community)
      return res.status(401).json({ message: "community not found" });

    if (adminId.toString() !== community.createdBy.toString())
      return res.status(401).json({ message: "Invalid Access" });

    const allowedUpdates = [
      "name",
      "bio",
      "image",
      "headline",
      "description",
      "isPrivate",
    ];

    const validateUpdate = Object.keys(req.body).every((val) =>
      allowedUpdates.includes(val)
    );
    if (!validateUpdate) res.status(401).json("Invalid updates");

    Object.keys(req.body).forEach((val) => community[val] = req.body[val]);

    await community.save();

    res.status(201).json({
      mesage: "Community edited successfully",
      community,
    });
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
}

module.exports = {
  createCommunityController,
  editCommunityController,
};

// try{

// }catch(err){
//     return res.status(400).json({message: err.message})
// }
