const User = require("../models/user.model");
const { validateUpdateProfile } = require("../Utilities/ValidateData");

async function getMyProfile(req, res) {
  try {
    const loggedInUser = await User.findById(req.user._id).select("-password");

    if (!loggedInUser)
      return res.status(404).json({ message: "User not found" });

    return res.json({
      message: "Fetch user successfully",
      user: loggedInUser,
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

async function updateMyProfile(req,res){
  try{
    // get the loggedin user
    const {_id} = req.user
    const loggedInUser = await User.findById(_id).select("-email -password -isActive -blockedUsers -createdAt -updatedAt -__v");

    if(!loggedInUser) return res.status(404).json({message:"user not found"})

    if(!validateUpdateProfile(req)){
      return res.status(400).json({message:"Updates are not allowed"})
    }

    Object.keys(req.body).forEach((key) => loggedInUser[key] = req.body[key])

    await loggedInUser.save()

    res.status(201).json({
      mesasge: `${loggedInUser.firstName + " " + loggedInUser.lastName}'s profile updated successfully`,
      loggedInUser
    })
  }catch(err){
    res.status(401).json({ message: err.message });
  }
}



module.exports = {
  getMyProfile,updateMyProfile
};
