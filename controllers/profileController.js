import User from "../model/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { generateEmbedding } from "../backend_rag_utils/embeddings.js";
import { computeMatchesForUser } from "../services/ragService.js";

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

  const textToEmbed = `${title} ${bio} ${Array.isArray(skills) ? skills.join(" ") : skills} ${experience} years experience`;
  const embedding = await generateEmbedding(textToEmbed);

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { $set: { ...req.body, description_embedding: embedding } },
    { new: true, runValidators: true },
  );

  setImmediate(() => {
    computeMatchesForUser(user._id.toString()).catch(err =>
      console.error("Background match computation error:", err)
    );
  });

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

  const updateFields = {};
  if (title) updateFields.title = title;
  if (experience) updateFields.experience = experience;
  if (bio) updateFields.bio = bio;
  if (skills) updateFields.skills = skills;

  if (title || bio || skills || experience) {
    const updatedTitle = title || user.title || "";
    const updatedBio = bio || user.bio || "";
    const updatedSkills = skills || user.skills || [];
    const updatedExperience = experience || user.experience || 0;

    const textToEmbed = `${updatedTitle} ${updatedBio} ${Array.isArray(updatedSkills) ? updatedSkills.join(" ") : updatedSkills} ${updatedExperience} years experience`;
    const embedding = await generateEmbedding(textToEmbed);
    updateFields.description_embedding = embedding;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("-password"); // never send password

  if (updateFields.description_embedding) {
    setImmediate(() => {
      computeMatchesForUser(userId.toString()).catch(err =>
        console.error("Background match computation error:", err)
      );
    });
  }

  res.status(200).json({
    message: "Profile updated successfully",
    data: updatedUser,
  });
});
