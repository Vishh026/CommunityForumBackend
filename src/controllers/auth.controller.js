const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { validatingSignupData } = require("../Utilities/ValidateData");
const bcrypt = require("bcrypt");
const validator = require("validator");

async function loginController(req, res) {
  try {
    // check email or password enteres??
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email or Password missing" });
    }
    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Invalid email" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid Credentials" });

    const token = await jwt.sign({ _id: user.id }, process.env.SECRETE_KEY, {
      expiresIn: "7d",
    });
    if (!token) return res.status(401).send("Invalid Token");

    res.cookie("Token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(201).json({ message: "User login successfully!!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function signupController(req, res) {
  try {
    const user = req.body;
    const { firstName, lastName, email, password, avtar, userName,role } = user;

    const error = validatingSignupData(user);
    if (error) {
      return res.status(400).json({ success: false, error });
    }
    const existingUser = await User.findOne({email})
    if(existingUser) return res.status(400).json({message: "User alredy exists"})

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      role: role || "user",
      email,
      avtar,
      userName,
      password: hashPassword,
    });

    await newUser.save();

    return res
      .status(201)
      .json({
        message: `${user.firstName + " " + user.lastName} register sucessfully`,
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  signupController,
  loginController,
};
