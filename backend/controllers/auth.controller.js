import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import { sendWelcomeEmail } from "../emails/emailHandler.js";
config();

export const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !password || !email) {
      return res.status(400).json({ message: "All fields are mandatory" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.cookie("jwt-linkedin", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ message: "User created successfully" });

    const profileUrl = `${process.env.PROFILEURL}/profile/${user.username}`;
    try {
      await sendWelcomeEmail(user.email, user.name, profileUrl);
    } catch (error) {
      console.error(`Error in sending email to ${user.email}:`, error.message);
      if (error.response) {
        console.error("Error response from email service:", error.response);
      }
    }
  } catch (error) {
    console.log(`Error in signup: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    res.status(400).json({ message: "invalid credentials" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(400).json({ message: "invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id }.process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  await res.cookie("jwt-token", token, {
    httpOnly: true,
    maxAge: 3 * 24 * 60 * 60 * 1000,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
};

export const logout = (req, res) => {
  res.clearCookie("jwt-linkedin");
  res.json({ message: "logged out successfully" });
};

export const getCurrentUser = (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.log("error in getUserController");
    res.status(400).json({ message: "server error" });
  }
};
