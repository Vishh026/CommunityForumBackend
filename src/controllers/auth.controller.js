const User = require("../models/user.model");
const { validatingSignupData } = require("../Utilities/ValidateData");
const validator = require("validator");
const {
  comparePassword,
  generateAccessToken,
  hashPassword,
} = require("../Utilities/helperFunctions");



async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email or Password missing" });
    }

    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Invalid credentials" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid Credentials" });

    const token = await generateAccessToken({
      _id: user._id,
      role: user.role
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(201)
      .json({ message: "User login successfully!!" , user: { _id: user._id, role: user.role }});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function signupController(req, res) {
  try {
    const user = req.body;
    const { firstName, lastName, email, password, profileURL, userName, role } =
      user;

    const error = validatingSignupData(user);
    if (error) {
      return res.status(400).json({ success: false, error });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User alredy exists" });

    const hashedPassword = await hashPassword(password);

    const allowedRole = ["user", "admin"];
    if (!allowedRole.includes(role)) role = "user"; 

    const newUser = new User({
      firstName,
      lastName,
      role: role || "user",
      email: email.toLowerCase(),
      profileURL,
      userName,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      message: `${user.firstName + " " + user.lastName} register sucessfully`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function logoutController(req, res) {
  try{

  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
  });

  return res.status(200).json({ message: "Logged out successfully" });
  }catch(err){
    res.status(401).json({message: err.message})
  }
}

async function getLoggedInUserController (req,res) {
    try {
        const user = req.user;
        
        return res.status(201).json({message: "Fetch logged-In user successfully",user})
    } catch (error) {
        res.status(401).json({message: err.message})
    }
}



module.exports = {
  signupController,
  loginController,
  logoutController,
  getLoggedInUserController
};
