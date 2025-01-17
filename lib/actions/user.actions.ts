"use server";

import { FilterQuery, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";

import Company from "../models/company.model";
import Careerpost from "../models/careerpost.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";
import { experience, qualification, skill } from "@/components/forms/AccountProfile";
import { clerkClient } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";

export async function fetchUser(userId: string) {
    try {
        connectToDB();

        return await User.findOne({ id: userId }).populate({
            path: "companies",
            model: Company,
        });
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
    skillSet: skill[];
    qualifications: qualification[];
    contactInfo: {
        email: string;
        phone: string;
        whatsapp: string;
        github: string;
    };
    experiences:experience[]
}

export async function updateUser({
    userId,
    bio,
    name,
    path,
    username,
    image,
    skillSet,
    qualifications,
    contactInfo,
    experiences
}: Params): Promise<void> {
    try {
        connectToDB();

        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
                skillSet: skillSet,
                qualifications: qualifications,
                contactInfo: contactInfo,
                experiences:experiences
            },
            { upsert: true }
        );

        if (path === "/profile/edit") {
            revalidatePath(path);
        }
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`);
    }
}

export async function deleteUser(userId: string) {
    try {
        connectToDB();
        const user = await User.findOne({ id: userId });
        if (user.image) {
            const utapi = new UTApi();
            const fileId = user.image.substring(18);
            await utapi.deleteFiles(fileId);

        }
        await clerkClient.users.deleteUser(userId);
        await User.findOneAndDelete({ id: userId });
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
}



export async function fetchUserPosts(userId: string) {
    try {
        connectToDB();

        // Find all careerposts authored by the user with the given userId
        const careerposts = await User.findOne({ id: userId }).populate({
            path: "careerposts",
            model: Careerpost,
            populate: [
                {
                    path: "company",
                    model: Company,
                    select: "name id image _id", // Select the "name" and "_id" fields from the "Company" model
                },
                {
                    path: "children",
                    model: Careerpost,
                    populate: {
                        path: "author",
                        model: User,
                        select: "name image id", // Select the "name" and "_id" fields from the "User" model
                    },

                },
                {
                    path: "likedBy",
                    model: User,
                    select: "name image id"
                }
            ],
        });
        return careerposts;
    } catch (error) {
        console.error("Error fetching user careerposts:", error);
        throw error;
    }
}

// Almost similar to Thead (search + pagination) and Company (search + pagination)
export async function fetchUsers({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc",
    searchedSkills = [],
}: {
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
    searchedSkills?: string[] | undefined;
}) {
    try {
        connectToDB();

        // Calculate the number of users to skip based on the page number and page size.
        const skipAmount = (pageNumber - 1) * pageSize;

        // Create a case-insensitive regular expression for the provided search string.
        const regex = new RegExp(searchString, "i");

        // Create an initial query object to filter users.
        const query: FilterQuery<typeof User> = {
            id: { $ne: userId }, // Exclude the current user from the results.
        };





        // If the search string is not empty, add the $or operator to match either username or name fields.
        if (searchString.trim() !== "") {

            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
                { bio: { $regex: regex } },

            ];
        }

        if (searchedSkills.length > 0 && searchedSkills[0] !== "") {
            query.$and = searchedSkills.map(skill => ({
                skillSet: {
                    $elemMatch: {
                        skillName: { $regex: new RegExp(skill.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }  // Replace special characters with their escaped equivalents
                    }
                }
            }))

        }

        // these are the characeters that need to be escaped in regex
        // . (dot): Matches any single character except newline.
        // * (asterisk): Matches zero or more of the preceding element.
        // + (plus): Matches one or more of the preceding element.
        // ? (question mark): Matches zero or one of the preceding element.
        // ^ (caret): Matches the beginning of the string.
        // $ (dollar sign): Matches the end of the string.
        // { and } (curly braces): Define a quantifier for the preceding element.
        // ( and ) (parentheses): Define a group or capture a match.
        // | (pipe): Acts as an OR operator.
        // [ and ] (square brackets): Define a character class.
        // \ (backslash): Escapes the next character, making it literal.



        // Define the sort options for the fetched users based on createdAt field and provided sort order.
        const sortOptions = { createdAt: sortBy };

        const usersQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize);

        // Count the total number of users that match the search criteria (without pagination).
        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        // Check if there are more users beyond the current page.
        const isNext = totalUsersCount > skipAmount + users.length;

        return { users, isNext };
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
}

export async function getCommentActivity(userId: string) {
    try {
        connectToDB();

        // Find all careerposts created by the user
        const userCareerposts = await Careerpost.find({ author: userId });

        // Collect all the child careerpost ids (replies) from the 'children' field of each user careerpost
        const childCareerpostIds = userCareerposts.reduce((acc, userCareerpost) => {
            return acc.concat(userCareerpost.children);
        }, []);

        // Find and return the child careerposts (replies) excluding the ones created by the same user
        const replies = await Careerpost.find({
            _id: { $in: childCareerpostIds },
            author: { $ne: userId }, // Exclude careerposts authored by the same user
        }).populate({
            path: "author",
            model: User,
            select: "name image _id",
        });

        return replies;
    } catch (error) {
        console.error("Error fetching replies: ", error);
        throw error;
    }
}



export async function getLikeActivity(userId: string) {
    try {
        connectToDB();

        // Find all careerposts created by the user
        const userCareerposts = await Careerpost.find({ author: userId }).populate({
            path: "likedBy",
            model: User,
            select: "name image id",
        });

        // Collect all the child careerpost ids (replies) from the 'children' field of each user careerpost


        return userCareerposts;
    } catch (error) {
        console.error("Error fetching replies: ", error);
        throw error;
    }
}