import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    techStack: [
      {
        type: String,
      },
    ],

    startDate: {
      type: Date,
      match: /^\d{4}-\d{2}-\d{2}$/
    },

    endDate: {
      type: Date,
      match: /^\d{4}-\d{2}-\d{2}$/
    },

    status: {
      type: String,
      enum: ["planned", "active", "completed"],
      default: "planned",
    },

    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    teamMembers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String }, // dev, tester, lead, etc.
      },
    ],

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    description_embedding: [
      {
        type: Number,
      },
    ],
  },
  { timestamps: true },
);

projectSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.startDate)
      ret.startDate = ret.startDate.toISOString().split("T")[0];
    if (ret.endDate)
      ret.endDate = ret.endDate.toISOString().split("T")[0];
    return ret;
  },
});


export default mongoose.model("Project", projectSchema);
