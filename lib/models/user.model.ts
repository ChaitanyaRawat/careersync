import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        unique: true,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: String,
    bio: String,
    threads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread",
        },
    ],
    onboarded: {
        type: Boolean,
        default: false,
    },
    communities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
        },
    ],
    likedPosts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread",
        },
    ],
    skillSet: [
        {
            skillName: {
                type: String,
                required: true,
            },
            credentials: [String],
        },
    ],
    // experiences: [
    //     {
    //         companyName: {
    //             type: mongoose.Schema.Types.ObjectId,
    //             ref: "Community",
    //             required: true,
    //         },
    //         position: {
    //             type: String,
    //             required: true,
    //         },
    //         credentials: [String],
    //     },
    // ],
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;