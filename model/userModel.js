import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    title: {
      type: String,
    },

    experience: {
      type: Number,
      min: 0,
    },

    bio: {
      type: String,
      maxlength: 500,
    },

    skills: [
      {
        type: String,
      },
    ],

    description_embedding: [
      {
        type: Number,
      },
    ],

    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },
  { timestamps: true }
);


export default mongoose.model("User", userSchema);

