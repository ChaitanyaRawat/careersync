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
    careerposts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Careerpost",
        },
    ],
    onboarded: {
        type: Boolean,
        default: false,
    },
    companies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
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
    qualifications: [
        {
            name: { type: String, required: true },
            credentialUrl: { type: String, required: true },
            // issueDate: { type: String, required: true },
            issuingAuthority: { type: String, required: true },
            image: { type: String, required: true },
        }
    ],
    contactInfo: {
        email: String,
        phone: String,
        whatsapp: String,
        github: String,
    },

    experiences: [
        {
            companyName: {
                type: String,
                required: true,
            },
            position: {
                type: String,
                required: true,
            },
            from: {
                type: Date,
                required: true,
            },
            to: {
                type: Date,
            },
            description: {
                type: String,
            },
            credential: String,
        },
    ],


});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;