
import mongoose from "mongoose";

const jobOpeningSchema = new mongoose.Schema({
  
    organisationId: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    demandedSkills: [String],
    attachment: {
        type: String,
    },
    urls: [String],
    applicationsRecieved: [
        {
            candidate: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            resume: {
                type: String
            },
            accepted: {
                type: Boolean,
                default: false
            }
            
        }
        
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },

});

const JobOpening =
    mongoose.models.JobOpening || mongoose.model("JobOpening", jobOpeningSchema);

export default JobOpening;