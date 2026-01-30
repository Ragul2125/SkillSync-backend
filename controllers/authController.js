import User from "../model/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// SIGNUP
export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    const error = new Error("Name, email and password are required");
    error.statusCode = 400;
    return next(error);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ name, email, password: hashedPassword });

  res.status(201).json({
    message: "User registered successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

// LOGIN
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    return next(error);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    return next(error);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    return next(error);
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  user.password = undefined;

  res.status(200).json({
    message: "Logged in successfully",
    token,
    user,
  });
});
