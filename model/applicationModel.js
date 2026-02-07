import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        applicantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        projectOwnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
        respondedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
applicationSchema.index({ applicantId: 1, projectId: 1 });
applicationSchema.index({ projectOwnerId: 1, status: 1 });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
