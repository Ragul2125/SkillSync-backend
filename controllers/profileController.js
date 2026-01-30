import User from "../model/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";

export const completeProfile = asyncHandler(async (req, res, next) => {
  const { title, experience, bio, skills } = req.body;

  //   const userId = req.user._id;
  if (!title || !experience || !bio || !skills) {
    const error = new Error("title, experience, bio and skills are required");
    error.statusCode = 400;
    return next(error);
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    const error = new Error("User not found!");
    error.statusCode = 404;
    return next(error);
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { $set: req.body },
    { new: true, runValidators: true },
  );
  res.status(201).json({
    message: "User profile updated successfully",
    data: {
      user: user,
      updated: updatedUser,
    },
  });
});

import mongoose from "mongoose";

export const getProfile = asyncHandler(async (req, res, next) => {

  const { userId } = req.params;

  console.log("Fetching profile for userId:", userId);
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError("Invalid user ID", 400));
  }

  const user = await User.findById(userId)
    .select("name title experience bio skills projects")
    .populate("projects", "name description techStack startDate endDate status");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    user,
  });
});

