import User from "../model/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

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


export const getProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  console.log("Fetching profile for userId:", userId);

  // Validate MongoDB ID
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("Invalid user ID");
    error.statusCode = 400;
    return next(error);
  }

  const user = await User.findById(userId)
    .select("name title experience bio skills projects")
    .populate(
      "projects",
      "name description techStack startDate endDate status"
    );

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    return next(error);
  }

  res.status(200).json({
    message: "User profile fetched successfully",
    data: user,
  });
});


export const editProfile = asyncHandler(async (req, res, next) => {
  const { title, experience, bio, skills } = req.body;

  // Check if at least one field is provided
  if (!title && !experience && !bio && !skills) {
    const error = new Error("Provide at least one field to update");
    error.statusCode = 400;
    return next(error);
  }

  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found!");
    error.statusCode = 404;
    return next(error);
  }

  // Build update object dynamically (only sent fields get updated)
  const updateFields = {};
  if (title) updateFields.title = title;
  if (experience) updateFields.experience = experience;
  if (bio) updateFields.bio = bio;
  if (skills) updateFields.skills = skills;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("-password"); // never send password

  res.status(200).json({
    message: "Profile updated successfully",
    data: updatedUser,
  });
});
