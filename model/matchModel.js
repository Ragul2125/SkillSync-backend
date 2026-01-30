import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sourceProjectId: {  // PROJECT that triggered matching
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },

    matchedUserId: {  // Recommended developer
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    matchedProjectId: {  // Recommended project
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },

    matchedType: {
      type: String,
      enum: ["USER", "PROJECT"],
      required: true,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    reason:{
      type: String
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Match", matchSchema);