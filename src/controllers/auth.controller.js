const User = require("../models/user.model");
const { validateSignupData } = require("../Utilities/ValidateData");
const validator = require("validator");
const {
  comparePassword,
  generateAccessToken,
  hashPassword,
} = require("../Utilities/helperFunctions")



async function loginController(req, res) {
  try {
    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({ message: "Email or password missing" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid credentials" });
    }


    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

  
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 4️⃣ Check verification for ADMIN
    if (user.role === "ADMIN" && !user.isVerified) {
      return res.status(403).json({ message: "Admin not verified yet" });
    }

    // 5️⃣ Generate JWT token (include role & adminType)
    const token = await generateAccessToken({
      _id: user._id,
      role: user.role,
      adminType: user.adminType || null,
      collegeId: user.collegeId
    });

    // 6️⃣ Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/"
    });

   
    await logAction({
      actorId: user._id,
      actorRole: user.role,
      action: "USER_LOGIN",
      entityType: "USER",
      entityId: user._id,
      metadata: { ip: req.ip, userAgent: req.headers["user-agent"] }
    });


    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        _id: user._id,
        role: user.role,
        adminType: user.adminType || null,
        collegeId: user.collegeId,
        department: user.department,
        batchYear: user.batchYear,
        isVerified: user.isVerified
      }
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}


async function signupController(req, res) {
  try {
    const user = req.body;
    const { firstName, lastName, email, password, profileURL, userName, role, 
        collegeId, department, batchYear, adminType } = user;

        let isVerified = false;
if(role === "USER") isVerified = true

    validateSignupData(user);

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User alredy exists" });

    const hashedPassword = await hashPassword(password);

    const allowedRole = ["USER", "ADMIN"];
    if (!allowedRole.includes(role)) role = "USER";

    const newUser = new User({
  firstName,
  lastName,
  role: role || "USER",
  adminType: adminType || null,
  email: email.toLowerCase(),
  profileURL: profileURL || "",
  userName,
  password: hashedPassword,
  collegeId,
  department,
  batchYear,
  isVerified
});


    await newUser.save();

    await logAction({
      actorId: newUser._id,
      actorRole: newUser.role,
      action: "USER_CREATED",
      entityType: "USER",
      entityId: newUser._id,
      metadata: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    return res.status(201).json({
      message: `${user.firstName + " " + user.lastName} register sucessfully`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function logoutController(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

async function getLoggedInUserController(req, res) {
  try {
    const user = req.user;

    return res
      .status(201)
      .json({ message: "Fetch logged-In user successfully", user });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
}

module.exports = {
  signupController,
  loginController,
  logoutController,
  getLoggedInUserController,
};
