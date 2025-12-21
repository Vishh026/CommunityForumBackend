const validator = require("validator");
const { isValidGithubUrl, isValidLinkedinUrl } = require("./helperFunctions");

const validatingSignupData = (data) => {
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

  // Required fields
  if (
    !firstName ||
    !lastName ||
    !role ||
    !email ||
    !password ||
    !profileURL ||
    !userName
  ) {
    return { field: "required", message: "Required fields are missing" };
  }

  // Email check
  if (!validator.isEmail(email)) {
    return { field: "email", message: "Invalid Email format" };
  }

  // Password check
  if (!validator.isStrongPassword(password)) {
    return { field: "password", message: "Password is too weak" };
  }

  // profileURL URL check
  if (!validator.isURL(profileURL)) {
    return { field: "profileURL", message: "URL is not valid" };
  }

  // Skills length
  if (skills.length > 8) {
    return { field: "skills", message: "Skills length exceeded" };
  }

  // GitHub & LinkedIn
  if (githubUrl && !isValidGithubUrl(githubUrl)) {
    return { field: "githubUrl", message: "Invalid GitHub profile URL" };
  }

  if (linkedinUrl && !isValidLinkedinUrl(linkedinUrl)) {
    return { field: "linkedinUrl", message: "Invalid LinkedIn profile URL" };
  }

  // Bio length
  if (bio && bio.length > 200) {
    return { field: "bio", message: "Bio too long" };
  }

  // Sanitize bio
  const cleanBio = bio ? validator.escape(bio.trim()) : "";

  return null;
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

  const updatesBody = Object.keys(req.body)

  if(updatesBody.length === 0) return false;

  const isUpdateAllowed = updatesBody.every((field) =>
    allowedUpdates.includes(field)
  );
  return isUpdateAllowed
};

// Utilities/sanitizeUser.js
const sanitizeUser = (user) => {
  if (!user) return null;
  const { firstName, lastName, userName, avatar, bio, headline, skills, publicVisibility, githubUrl, linkedinUrl } = user;
  return { firstName, lastName, userName, avatar, bio, headline, skills, publicVisibility, githubUrl, linkedinUrl };
}


module.exports = {
  validatingSignupData,
  validateUpdateProfile,
  sanitizeUser
};
