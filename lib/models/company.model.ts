import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
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
    websiteUrl: String,
    image: String,
    bio: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    careerposts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Careerpost",
        },
    ],
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
});

const Company =
    mongoose.models.Company || mongoose.model("Company", companySchema);

export default Company;