const validator = require("validator");
const { isValidGithubUrl, isValidLinkedinUrl } = require("./helperFunctions");

const validateSignupData = (data) => {
  const {
    firstName,
    lastName,
    role,
    email,
    password,
    skills = [],
    profileURL,
    userName,
    githubUrl,
    linkedinUrl,
    bio,
  } = data;

  if (![firstName, lastName, role, email, password, profileURL, userName].every(Boolean)) {
    throw new Error("Required fields are missing");
  }

  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error("Password is too weak");
  }

  if (!validator.isURL(profileURL)) {
    throw new Error("Invalid profile URL");
  }

  if (!Array.isArray(skills) || skills.length > 8) {
    throw new Error("Skills must be an array (max 8)");
  }

  if (githubUrl && !isValidGithubUrl(githubUrl)) {
    throw new Error("Invalid GitHub URL");
  }

  if (linkedinUrl && !isValidLinkedinUrl(linkedinUrl)) {
    throw new Error("Invalid LinkedIn URL");
  }

  if (bio && bio.length > 200) {
    throw new Error("Bio too long");
  }

  if(role === "ADMIN" && !adminType) {
  return res.status(400).json({ message: "adminType is required for admin role" });
}

if(role === "USER" && adminType) {
  return res.status(400).json({ message: "Users cannot have adminType" });
}

if(!collegeId || !department || !batchYear){
  return res.status(400).json({ message: "collegeId, department and batchYear are required" });
}

  return true; 
};

const validateUpdateProfile = (req) => {
  const allowedUpdates = [
    "firstName",
    "lastName",
    "userName",
    "gender",
    "profileURL",
    "githubUrl",
    "linkedinUrl",
    "headline",
    "bio",
    "skills",
    "publicVisibility",
  ];

  const updatesBody = Object.keys(req.body);

  if (updatesBody.length === 0) {
    throw new Error("No fields provided for update");
  }

  const isUpdateAllowed = updatesBody.every((field) =>
    allowedUpdates.includes(field)
  );

  if (!isUpdateAllowed) {
    throw new Error("One or more fields are not allowed to be updated");
  }

  // 🔎 Field-level validation
  const { profileURL, githubUrl, linkedinUrl, skills, bio } = req.body;

  if (profileURL && !validator.isURL(profileURL)) {
    throw new Error("Invalid profile URL");
  }

  if (githubUrl && !isValidGithubUrl(githubUrl)) {
    throw new Error("Invalid GitHub URL");
  }

  if (linkedinUrl && !isValidLinkedinUrl(linkedinUrl)) {
    throw new Error("Invalid LinkedIn URL");
  }

  if (skills && (!Array.isArray(skills) || skills.length > 8)) {
    throw new Error("Skills must be an array (max 8)");
  }

  if (bio && bio.length > 200) {
    throw new Error("Bio too long");
  }

  return true; // ✅ consistency matters
};

const sanitizeUser = (user) => {
  if (!user) return null;

  const {
    _id,
    firstName,
    lastName,
    userName,
    profileURL,
    avatar,
    bio,
    headline,
    skills,
    publicVisibility,
    githubUrl,
    linkedinUrl,
    role,
    adminType,
    collegeId,
    department,
    batchYear,
    isVerified,
  } = user;

  return {
    _id,
    firstName,
    lastName,
    userName,
    profileURL,
    avatar,
    bio,
    headline,
    skills,
    publicVisibility,
    githubUrl,
    linkedinUrl,
    role,
    adminType,
    collegeId,
    department,
    batchYear,
    isVerified,
  };
};

const validateCommunityData = (data) => {
  const { name, image, isPrivate, rules } = data;

  // name
  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("Community name is required");
  }

  if (name.trim().length < 3) {
    throw new Error("Community name must be at least 3 characters");
  }

  // image
  if (image && typeof image !== "string") {
    throw new Error("Image must be a valid URL string");
  }

  // rules
  if (rules && !Array.isArray(rules)) {
    throw new Error("Rules must be an array");
  }

  // isPrivate
  if (isPrivate !== undefined && typeof isPrivate !== "boolean") {
    throw new Error("isPrivate must be true or false");
  }

  return true; // ✅ success contract
};




module.exports = {
  validateSignupData,
  validateUpdateProfile,
  sanitizeUser,
  validateCommunityData
};
