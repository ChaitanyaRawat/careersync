import mongoose from "mongoose";

const careerpostSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    parentId: {
        type: String,
    },
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Careerpost",
        },
    ],
    likedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    tags: [String],
    urls: [String],
    attachment: {
        type: String,
    },

});

const Careerpost = mongoose.models.Careerpost || mongoose.model("Careerpost", careerpostSchema);

export default Careerpost;