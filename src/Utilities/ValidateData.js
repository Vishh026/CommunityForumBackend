const validator = require("validator");
const { isValidGithubUrl, isValidLinkedinUrl } = require("./helperFunctions");

const validateSignupData = (data) => {
  const {
    firstName,
    lastName,
    role,
    email,
    password,
    bio,
    skills = [],
    headline,
    profileURL,
    userName,
    githubUrl,
    linkedinUrl,
  } = data;

  // 🔥 CHANGED: strict required checks
  if (![firstName, lastName, role, email, password, profileURL, userName].every(Boolean)) {
    return { error: { field: "required", message: "Required fields are missing" } };
  }

  if (!validator.isEmail(email)) {
    return { error: { field: "email", message: "Invalid email format" } };
  }

  if (!validator.isStrongPassword(password)) {
    return { error: { field: "password", message: "Password is too weak" } };
  }

  if (!validator.isURL(profileURL)) {
    return { error: { field: "profileURL", message: "Invalid profile URL" } };
  }

  if (!Array.isArray(skills) || skills.length > 8) {
    return { error: { field: "skills", message: "Skills must be an array (max 8)" } };
  }

  if (githubUrl && !isValidGithubUrl(githubUrl)) {
    return { error: { field: "githubUrl", message: "Invalid GitHub URL" } };
  }

  if (linkedinUrl && !isValidLinkedinUrl(linkedinUrl)) {
    return { error: { field: "linkedinUrl", message: "Invalid LinkedIn URL" } };
  }

  if (bio && bio.length > 200) {
    return { error: { field: "bio", message: "Bio too long" } };
  }

  return { error: null }; // 🔥 CONSISTENT RETURN
};

const validateUpdateProfile = (body) => {
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

  const updates = Object.keys(body);

  if (updates.length === 0) {
    return { error: { field: "body", message: "Empty update payload" } };
  }

  // 🔥 CHANGED: whitelist enforcement
  const isAllowed = updates.every((field) => allowedUpdates.includes(field));
  if (!isAllowed) {
    return { error: { field: "field", message: "Invalid update field" } };
  }

  // 🔥 VALUE VALIDATION
  if (body.firstName && body.firstName.trim() === "") {
    return { error: { field: "firstName", message: "First name cannot be empty" } };
  }

  if (body.skills && (!Array.isArray(body.skills) || body.skills.length > 8)) {
    return { error: { field: "skills", message: "Invalid skills array" } };
  }

  if (body.publicVisibility && !["PUBLIC", "PRIVATE"].includes(body.publicVisibility)) {
    return { error: { field: "publicVisibility", message: "Invalid visibility value" } };
  }

  if (body.githubUrl && !isValidGithubUrl(body.githubUrl)) {
    return { error: { field: "githubUrl", message: "Invalid GitHub URL" } };
  }

  if (body.linkedinUrl && !isValidLinkedinUrl(body.linkedinUrl)) {
    return { error: { field: "linkedinUrl", message: "Invalid LinkedIn URL" } };
  }

  return { error: null }; // 🔥 CONSISTENT
};


const sanitizeUser = (user) => {
  if (!user) return null;
  const { firstName, lastName, userName, avatar, bio, headline, skills, publicVisibility, githubUrl, linkedinUrl } = user;
  return { firstName, lastName, userName, avatar, bio, headline, skills, publicVisibility, githubUrl, linkedinUrl };
}

const validateCommunityData = (data) => {
  const { name, image, isPrivate, rules } = data;

  // Required
  if (!name || typeof name !== "string" || !name.trim()) {
    return { field: "name", message: "Community name is required" };
  }

  if (name.trim().length < 3) {
    return { field: "name", message: "Community name must be at least 3 characters" };
  }

  // Image
  if (image && typeof image !== "string") {
    return { field: "image", message: "Image must be a valid URL string" };
  }

  // Rules
  if (rules && !Array.isArray(rules)) {
    return { field: "rules", message: "Rules must be an array" };
  }

  // isPrivate
  if (isPrivate !== undefined && typeof isPrivate !== "boolean") {
    return { field: "isPrivate", message: "isPrivate must be true or false" };
  }

  return null; // ✅ Pattern A respected
};



module.exports = {
  validateSignupData,
  validateUpdateProfile,
  sanitizeUser,
  validateCommunityData
};
