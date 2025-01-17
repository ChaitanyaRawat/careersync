"use server";

import mongoose, { FilterQuery, SortOrder } from "mongoose";

import Company from "../models/company.model";
import Careerpost from "../models/careerpost.model";
import User from "../models/user.model";
import JobOpening from "../models/jobOpening.model";
import { connectToDB } from "../mongoose";
import { UTApi } from "uploadthing/server";

export async function createCompany(
    id: string,
    name: string,
    username: string,
    image: string,
    bio: string,
    createdById: string // Change the parameter name to reflect it's an id
) {
    try {
        connectToDB();

        // Find the user with the provided unique id
        const user = await User.findOne({ id: createdById });

        if (!user) {
            throw new Error("User not found"); // Handle the case if the user with the id is not found
        }

        const newCompany = new Company({
            id,
            name,
            username,
            image,
            bio,
            createdBy: user._id, // Use the mongoose ID of the user
        });

        const createdCompany = await newCompany.save();

        // Update User model
        user.companies.push(createdCompany._id);
        await user.save();

        return createdCompany;
    } catch (error) {
        // Handle any errors
        console.error("Error creating company:", error);
        throw error;
    }
}

export async function fetchCompanyDetails(id: string) {
    try {
        connectToDB();

        const companyDetails = await Company.findOne({ id }).populate([
            "createdBy",
            {
                path: "members",
                model: User,
                select: "name username image _id id",
            },
        ]);

        return companyDetails;
    } catch (error) {
        // Handle any errors
        console.error("Error fetching company details:", error);
        throw error;
    }
}

export async function fetchCompanyPosts(id: string) {
    try {
        connectToDB();

        const companyPosts = await Company.findById(id).populate({
            path: "careerposts",
            model: Careerpost,
            populate: [
                {
                    path: "author",
                    model: User,
                    select: "name image id", // Select the "name" and "_id" fields from the "User" model
                },
                {
                    path: "children",
                    model: Careerpost,
                    populate: {
                        path: "author",
                        model: User,
                        select: "image _id", // Select the "name" and "_id" fields from the "User" model
                    },
                },
                {
                    path: "likedBy",
                    model: User,
                    select: "name image id",
                }
            ],
        });

        return companyPosts;
    } catch (error) {
        // Handle any errors
        console.error("Error fetching company posts:", error);
        throw error;
    }
}

export async function fetchCompanies({
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc",
}: {
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
}) {
    try {
        connectToDB();

        // Calculate the number of companies to skip based on the page number and page size.
        const skipAmount = (pageNumber - 1) * pageSize;

        // Create a case-insensitive regular expression for the provided search string.
        const regex = new RegExp(searchString, "i");

        // Create an initial query object to filter companies.
        const query: FilterQuery<typeof Company> = {};

        // If the search string is not empty, add the $or operator to match either username or name fields.
        if (searchString.trim() !== "") {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
            ];
        }

        // Define the sort options for the fetched companies based on createdAt field and provided sort order.
        const sortOptions = { createdAt: sortBy };

        // Create a query to fetch the companies based on the search and sort criteria.
        const companiesQuery = Company.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize)
            .populate("members");

        // Count the total number of companies that match the search criteria (without pagination).
        const totalCompaniesCount = await Company.countDocuments(query);

        const companies = await companiesQuery.exec();

        // Check if there are more companies beyond the current page.
        const isNext = totalCompaniesCount > skipAmount + companies.length;

        return { companies, isNext };
    } catch (error) {
        console.error("Error fetching companies:", error);
        throw error;
    }
}

export async function addMemberToCompany(
    companyId: string,
    memberId: string
) {
    try {
        connectToDB();

        // Find the company by its unique id
        const company = await Company.findOne({ id: companyId });

        if (!company) {
            throw new Error("Company not found");
        }

        // Find the user by their unique id
        const user = await User.findOne({ id: memberId });

        if (!user) {
            throw new Error("User not found");
        }

        // Check if the user is already a member of the company
        if (company.members.includes(user._id)) {
            throw new Error("User is already a member of the company");
        }

        // Add the user's _id to the members array in the company
        company.members.push(user._id);
        await company.save();

        // Add the company's _id to the companies array in the user
        user.companies.push(company._id);
        await user.save();

        return company;
    } catch (error) {
        // Handle any errors
        console.error("Error adding member to company:", error);
        throw error;
    }
}

export async function removeUserFromCompany(
    userId: string,
    companyId: string
) {
    try {
        connectToDB();

        const userIdObject = await User.findOne({ id: userId }, { _id: 1 });
        const companyIdObject = await Company.findOne(
            { id: companyId },
            { _id: 1 }
        );

        if (!userIdObject) {
            throw new Error("User not found");
        }

        if (!companyIdObject) {
            throw new Error("Company not found");
        }

        // Remove the user's _id from the members array in the company
        await Company.updateOne(
            { _id: companyIdObject._id },
            { $pull: { members: userIdObject._id } }
        );

        // Remove the company's _id from the companies array in the user
        await User.updateOne(
            { _id: userIdObject._id },
            { $pull: { companies: companyIdObject._id } }
        );

        return { success: true };
    } catch (error) {
        // Handle any errors
        console.error("Error removing user from company:", error);
        throw error;
    }
}

export async function updateCompanyInfo(
    companyId: string,
    name: string,
    username: string,
    image: string,
    bio?: string,
    websiteUrl?: string
) {
    try {
        connectToDB();

     
        // Find the company by its _id and update the information
        const updatedCompany = await Company.findOneAndUpdate(
            { id: companyId },
            { name, username, image, bio: bio ? bio : "", websiteUrl: websiteUrl ? websiteUrl : "" },
        );

        if (!updatedCompany) {
            throw new Error("Company not found");
        }

        // return updatedCompany;
    } catch (error) {
        // Handle any errors
        console.error("Error updating company information:", error);
        throw error;
    }
}

export async function deleteCompany(companyId: string) {
    try {
        connectToDB();

        // Find the company by its ID and delete it
        const deletedCompany = await Company.findOneAndDelete({
            id: companyId,
        });

        if (!deletedCompany) {
            throw new Error("Company not found");
        }

        // Delete all careerposts associated with the company
        await Careerpost.deleteMany({ company: companyId });

        // Find all users who are part of the company
        const companyUsers = await User.find({ companies: companyId });

        // Remove the company from the 'companies' array for each user
        const updateUserPromises = companyUsers.map((user) => {
            user.companies.pull(companyId);
            return user.save();
        });

        await Promise.all(updateUserPromises);

        return deletedCompany;
    } catch (error) {
        console.error("Error deleting company: ", error);
        throw error;
    }
}



export async function createJobOpening(
    { orgId, creatorId, title, description, demandedSkills, attachment, urls }
        : {
            orgId: string,
            creatorId: string,
            title: string,
            description: string,
            demandedSkills: string[],
            attachment: string,
            urls: string[],
        }) {

    try {
        connectToDB();
        await JobOpening.create({
            organisationId: orgId,
            createdBy: new mongoose.Types.ObjectId(creatorId),
            title: title,
            description: description,
            demandedSkills: demandedSkills,
            attachment: attachment,
            urls: urls
        });
     

    } catch (error: any) {
        console.error("Error creating job opening: ", error);
        throw error;
    }
}

export async function fetchJobOpeningsOfCompany(orgId: string) {
    try {
        connectToDB();
        const jobOpening = await JobOpening.find({ organisationId: orgId }).populate("createdBy", "name image id");

        return jobOpening;
    } catch (error) {
        console.error("Error fetching job opening: ", error);
        throw error;
    }
}



export async function deleteJobOpening(oid: string): Promise<void> {
    try {
        connectToDB();
        const utapi = new UTApi();

       


        const jobOpening: any = await JobOpening.findById(oid);

        if (!jobOpening) {
            throw new Error("Job opening not found");
        }

        if (jobOpening.attachment) {
            const fileId = jobOpening.attachment.substring(18);
         

            await utapi.deleteFiles(fileId);
        }

        await JobOpening.deleteOne({ _id: oid });


    } catch (error) {
        console.error("Error fetching job opening: ", error);
        throw error;
    }
}

export async function fetchJobOpeningById(oid: string) {
    try {
        connectToDB();
        const jobOpening = await JobOpening.findById(oid)

        return jobOpening
    } catch (error) {
        console.error("Error fetching job opening: ", error);
        throw error;
    }
}

export async function addApplication({ oid, userOid, resume }: { oid: string, userOid: string, resume: string }) {
    try {
        connectToDB();
        const jobOpening: any = await JobOpening.findById(oid);

        jobOpening.applicationsRecieved.push({ candidate: userOid, resume: resume });
        await jobOpening.save();


    } catch (error: any) {
        console.error("Error adding application: ", error);
        throw error;
    }
}

export async function userHasAppliedForJobOpening({ userId, oid }: { userId: string, oid: string }) {
    try {
        connectToDB();
        const jobOpening: any = await JobOpening.findById(oid);
        for (const application of jobOpening.applicationsRecieved) {
            if (application.candidate.toString() == userId) {
                return { status: true, application: application }
            }
        }
        return { status: false, application: null }


    } catch (error: any) {
        console.error("Error checking if the user applied: ", error);
    }
}

export async function revokeApplication({ oid, userOid }: { oid: string, userOid: string }) {
    try {
        connectToDB();
        const utapi = new UTApi();
        const jobOpening: any = await JobOpening.findById(oid);
        const application = await jobOpening.applicationsRecieved.find((application: any) => application.candidate.toString() === userOid);
   
        await jobOpening.applicationsRecieved.pull({ candidate: userOid });
        if (application.resume) {
            const fileId = application.resume.substring(18);
       

            await utapi.deleteFiles(fileId);
        }
        await jobOpening.save();

    } catch (error: any) {
        console.error("Error revoking application: ", error);
        throw error;
    }
}

export async function fetchApplicationsForJobOpening(oid: string) {
    try {
        connectToDB();
        const jobOpening: any = await JobOpening.findById(oid).populate("applicationsRecieved.candidate", "name image id accepted");
   
        return jobOpening.applicationsRecieved;
    } catch (error: any) {
        console.error("Error fetching applications: ", error);
        throw error;
    }
}

export async function acceptApplication({ oid, userOid }: { oid: string, userOid: string }) {
    try {
        connectToDB();
        
        await JobOpening.updateOne({ _id: oid, "applicationsRecieved.candidate": userOid }, { $set: { "applicationsRecieved.$.accepted": true } });



    } catch (error: any) {
        console.error("Error accepting application: ", error);
        throw error;
    }
}

// reject
export async function rejectApplication({ oid, userOid }: { oid: string, userOid: string }) {
    try {
        connectToDB();
        await JobOpening.updateOne({ _id: oid, "applicationsRecieved.candidate": userOid }, { $set: { "applicationsRecieved.$.accepted": false } });

    } catch (error: any) {
        console.error("Error rejecting application: ", error);
        throw error;
    }
}


export async function fetchAllJobOpenings(pageNumber = 1, pageSize = 20, query = "", skills: string[] = []) {
    connectToDB();

    const queryRegex = new RegExp(query.trim(), "i");
    // Calculate the number of posts to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;
    const mainQuery: FilterQuery<typeof JobOpening> = {
        $or: [
            { title: { $regex: queryRegex } },
            { description: { $regex: queryRegex } },
        ],


    }
    if (skills.length > 0) {
        mainQuery.$and = skills.map(skill => ({
            demandedSkills: { $regex: new RegExp(skill.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }  // Replace special characters with their escaped equivalents

        }))
    }

    // Create a query to fetch the posts that have no parent (top-level careerposts) (a careerpost that is not a comment/reply).

    const openingQuery = JobOpening.find(mainQuery)
        .populate({
            path: "createdBy",
            model: User,
            select: "name image id",
        })
        .sort({ createdAt: "desc" })
        .skip(skipAmount)
        .limit(pageSize)






    // Count the total number of top-level posts (careerposts) i.e., careerposts that are not comments.
    const totalOpportunitiesCount = await JobOpening.countDocuments(mainQuery); // Get the total count of posts

    const opportunities = await openingQuery.exec();

    const isNext = totalOpportunitiesCount > skipAmount + opportunities.length;

    return { opportunities, isNext };
}




