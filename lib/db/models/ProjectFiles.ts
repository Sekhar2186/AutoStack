import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
    {
        projectId: {
            type: String,
            required: true,
            index: true
        },

        userId: {
            type: String
        },

        version: {
            type: String,
            required: true,
            default: "v1"
        },

        appName: String,

        blueprint: {
            type: Object,
            default: {}
        },

        files: {
            type: Object,
            default: {}
        },

        docs: {
            type: Object,
            default: {}
        },

        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export const Project =
    mongoose.models.Project ||
    mongoose.model("Project", ProjectSchema);