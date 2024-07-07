"use server";

import mongoose, { FilterQuery, SortOrder } from "mongoose";

import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import JobOpening from "../models/jobOpening.model";
import { connectToDB } from "../mongoose";
import { UTApi } from "uploadthing/server";

export async function createCommunity(
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

        const newCommunity = new Community({
            id,
            name,
            username,
            image,
            bio,
            createdBy: user._id, // Use the mongoose ID of the user
        });

        const createdCommunity = await newCommunity.save();

        // Update User model
        user.communities.push(createdCommunity._id);
        await user.save();

        return createdCommunity;
    } catch (error) {
        // Handle any errors
        console.error("Error creating community:", error);
        throw error;
    }
}

export async function fetchCommunityDetails(id: string) {
    try {
        connectToDB();

        const communityDetails = await Community.findOne({ id }).populate([
            "createdBy",
            {
                path: "members",
                model: User,
                select: "name username image _id id",
            },
        ]);

        return communityDetails;
    } catch (error) {
        // Handle any errors
        console.error("Error fetching community details:", error);
        throw error;
    }
}

export async function fetchCommunityPosts(id: string) {
    try {
        connectToDB();

        const communityPosts = await Community.findById(id).populate({
            path: "threads",
            model: Thread,
            populate: [
                {
                    path: "author",
                    model: User,
                    select: "name image id", // Select the "name" and "_id" fields from the "User" model
                },
                {
                    path: "children",
                    model: Thread,
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

        return communityPosts;
    } catch (error) {
        // Handle any errors
        console.error("Error fetching community posts:", error);
        throw error;
    }
}

export async function fetchCommunities({
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

        // Calculate the number of communities to skip based on the page number and page size.
        const skipAmount = (pageNumber - 1) * pageSize;

        // Create a case-insensitive regular expression for the provided search string.
        const regex = new RegExp(searchString, "i");

        // Create an initial query object to filter communities.
        const query: FilterQuery<typeof Community> = {};

        // If the search string is not empty, add the $or operator to match either username or name fields.
        if (searchString.trim() !== "") {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
            ];
        }

        // Define the sort options for the fetched communities based on createdAt field and provided sort order.
        const sortOptions = { createdAt: sortBy };

        // Create a query to fetch the communities based on the search and sort criteria.
        const communitiesQuery = Community.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize)
            .populate("members");

        // Count the total number of communities that match the search criteria (without pagination).
        const totalCommunitiesCount = await Community.countDocuments(query);

        const communities = await communitiesQuery.exec();

        // Check if there are more communities beyond the current page.
        const isNext = totalCommunitiesCount > skipAmount + communities.length;

        return { communities, isNext };
    } catch (error) {
        console.error("Error fetching communities:", error);
        throw error;
    }
}

export async function addMemberToCommunity(
    communityId: string,
    memberId: string
) {
    try {
        connectToDB();

        // Find the community by its unique id
        const community = await Community.findOne({ id: communityId });

        if (!community) {
            throw new Error("Community not found");
        }

        // Find the user by their unique id
        const user = await User.findOne({ id: memberId });

        if (!user) {
            throw new Error("User not found");
        }

        // Check if the user is already a member of the community
        if (community.members.includes(user._id)) {
            throw new Error("User is already a member of the community");
        }

        // Add the user's _id to the members array in the community
        community.members.push(user._id);
        await community.save();

        // Add the community's _id to the communities array in the user
        user.communities.push(community._id);
        await user.save();

        return community;
    } catch (error) {
        // Handle any errors
        console.error("Error adding member to community:", error);
        throw error;
    }
}

export async function removeUserFromCommunity(
    userId: string,
    communityId: string
) {
    try {
        connectToDB();

        const userIdObject = await User.findOne({ id: userId }, { _id: 1 });
        const communityIdObject = await Community.findOne(
            { id: communityId },
            { _id: 1 }
        );

        if (!userIdObject) {
            throw new Error("User not found");
        }

        if (!communityIdObject) {
            throw new Error("Community not found");
        }

        // Remove the user's _id from the members array in the community
        await Community.updateOne(
            { _id: communityIdObject._id },
            { $pull: { members: userIdObject._id } }
        );

        // Remove the community's _id from the communities array in the user
        await User.updateOne(
            { _id: userIdObject._id },
            { $pull: { communities: communityIdObject._id } }
        );

        return { success: true };
    } catch (error) {
        // Handle any errors
        console.error("Error removing user from community:", error);
        throw error;
    }
}

export async function updateCommunityInfo(
    communityId: string,
    name: string,
    username: string,
    image: string,
    bio?: string,
    websiteUrl?: string
) {
    try {
        connectToDB();

        console.log("bio = ", bio);
        console.log("websiteUrl = ", websiteUrl);
        // Find the community by its _id and update the information
        const updatedCommunity = await Community.findOneAndUpdate(
            { id: communityId },
            { name, username, image, bio: bio ? bio : "", websiteUrl: websiteUrl ? websiteUrl : "" },
        );

        if (!updatedCommunity) {
            throw new Error("Community not found");
        }

        // return updatedCommunity;
    } catch (error) {
        // Handle any errors
        console.error("Error updating community information:", error);
        throw error;
    }
}

export async function deleteCommunity(communityId: string) {
    try {
        connectToDB();

        // Find the community by its ID and delete it
        const deletedCommunity = await Community.findOneAndDelete({
            id: communityId,
        });

        if (!deletedCommunity) {
            throw new Error("Community not found");
        }

        // Delete all threads associated with the community
        await Thread.deleteMany({ community: communityId });

        // Find all users who are part of the community
        const communityUsers = await User.find({ communities: communityId });

        // Remove the community from the 'communities' array for each user
        const updateUserPromises = communityUsers.map((user) => {
            user.communities.pull(communityId);
            return user.save();
        });

        await Promise.all(updateUserPromises);

        return deletedCommunity;
    } catch (error) {
        console.error("Error deleting community: ", error);
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
        console.log("create job opening sucessfully");

    } catch (error: any) {
        console.error("Error creating job opening: ", error);
        throw error;
    }
}

export async function fetchJobOpeningOfOrganisation(orgId: string) {
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

        console.log("oid = ", oid);


        const jobOpening: any = await JobOpening.findById(oid);

        if (!jobOpening) {
            throw new Error("Job opening not found");
        }

        if (jobOpening.attachment) {
            const fileId = jobOpening.attachment.substring(18);
            // console.log("fileId = ", fileId);

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
        console.log("application = ", application);
        await jobOpening.applicationsRecieved.pull({ candidate: userOid });
        if (application.resume) {
            const fileId = application.resume.substring(18);
            // console.log("fileId = ", fileId);

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
        // console.log("jobOpening = ", jobOpening);
        return jobOpening.applicationsRecieved;
    } catch (error: any) {
        console.error("Error fetching applications: ", error);
        throw error;
    }
}

export async function acceptApplication({ oid, userOid }: { oid: string, userOid: string }) {
    try {
        connectToDB();
        console.log("oid = ", oid);
        console.log("userOid = ", userOid);
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
    console.log("skills = ", skills);
    console.log("query = ", query);
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

    // Create a query to fetch the posts that have no parent (top-level threads) (a thread that is not a comment/reply).

    const openingQuery = JobOpening.find(mainQuery)
        .populate({
            path: "createdBy",
            model: User,
            select: "name image id",
        })
        .sort({ createdAt: "desc" })
        .skip(skipAmount)
        .limit(pageSize)






    // Count the total number of top-level posts (threads) i.e., threads that are not comments.
    const totalOpportunitiesCount = await JobOpening.countDocuments(mainQuery); // Get the total count of posts

    const opportunities = await openingQuery.exec();

    const isNext = totalOpportunitiesCount > skipAmount + opportunities.length;

    return { opportunities, isNext };
}




