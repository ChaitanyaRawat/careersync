"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";

import User from "../models/user.model";
import Careerpost from "../models/careerpost.model";
import Company from "../models/company.model";
import { UTApi } from "uploadthing/server";
import { fetchUser } from "./user.actions";
import { FilterQuery } from "mongoose";

export async function fetchPosts(pageNumber = 1, pageSize = 20, query = "", tags: string[] = []) {
    connectToDB();
   
    const queryRegex = new RegExp(query.trim(), "i");
    // Calculate the number of posts to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;
    const mainQuery: FilterQuery<typeof Careerpost> = {
        parentId: { $in: [null, undefined] },
        text: { $regex: queryRegex },

    }
    if (tags.length > 0) {
        mainQuery.$and = tags.map(tag => ({
            tags: { $regex: new RegExp(tag.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }  // Replace special characters with their escaped equivalents

        }))
    }

    // Create a query to fetch the posts that have no parent (top-level careerposts) (a careerpost that is not a comment/reply).
    const postsQuery = Careerpost.find(mainQuery)
        .sort({ createdAt: "desc" })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({
            path: "author",
            model: User,
        })
        .populate({
            path: "company",
            model: Company,
        })
        .populate({
            path: "children", // Populate the children field
            populate: {
                path: "author", // Populate the author field within children
                model: User,
                select: "_id name parentId image", // Select only _id and username fields of the author
            },
        }).populate({
            path: "likedBy",
            model: User,
            select: "id name image",
        });

    // Count the total number of top-level posts (careerposts) i.e., careerposts that are not comments.
    const totalPostsCount = await Careerpost.countDocuments({
        parentId: { $in: [null, undefined] },
    }); // Get the total count of posts

    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };
}

interface Params {
    text: string,
    author: string,
    companyId: string | null,
    path: string,
    tags: string[],
    urls: string[],
    attachment: string | null | undefined,
}

export async function createCareerpost({ text, author, companyId, path, tags, urls, attachment }: Params
) {
    try {
        connectToDB();

        const companyIdObject = await Company.findOne(
            { id: companyId },
            { _id: 1 }
        );

        const createdCareerpost = await Careerpost.create({
            text,
            author,
            company: companyIdObject, // Assign companyId if provided, or leave it null for personal account
            likedBy: [],
            tags: tags,
            urls: urls,
            attachment: ((attachment !== undefined && attachment !== "") ? attachment : null),
        });

        // Update User model
        await User.findByIdAndUpdate(author, {
            $push: { careerposts: createdCareerpost._id },
        });

        if (companyIdObject) {
            // Update Company model
            await Company.findByIdAndUpdate(companyIdObject, {
                $push: { careerposts: createdCareerpost._id },
            });
        }

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to create careerpost: ${error.message}`);
    }
}

async function fetchAllChildCareerposts(careerpostId: string): Promise<any[]> {
    const childCareerposts = await Careerpost.find({ parentId: careerpostId });

    const descendantCareerposts = [];
    for (const childCareerpost of childCareerposts) {
        const descendants = await fetchAllChildCareerposts(childCareerpost._id);
        descendantCareerposts.push(childCareerpost, ...descendants);
    }

    return descendantCareerposts;
}

export async function deleteCareerpost(id: string, path: string): Promise<void> {
    try {
        const utapi = new UTApi();
        connectToDB();

      
        const mainCareerpost = await Careerpost.findById(id).populate("author company");
        if (mainCareerpost.attachment) {
            const fileId = mainCareerpost.attachment.substring(18);
            

            await utapi.deleteFiles(fileId);
        }

        if (!mainCareerpost) {
            throw new Error("Careerpost not found");
        }

        // Fetch all child careerposts and their descendants recursively
        const descendantCareerposts = await fetchAllChildCareerposts(id);

        // Get all descendant careerpost IDs including the main careerpost ID and child careerpost IDs
        const descendantCareerpostIds = [
            id,
            ...descendantCareerposts.map((careerpost) => careerpost._id),
        ];

        // Extract the authorIds and companyIds to update User and Company models respectively
        const uniqueAuthorIds = new Set(
            [
                ...descendantCareerposts.map((careerpost) => careerpost.author?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainCareerpost.author?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        const uniqueCompanyIds = new Set(
            [
                ...descendantCareerposts.map((careerpost) => careerpost.company?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainCareerpost.company?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        // Recursively delete child careerposts and their descendants
        await Careerpost.deleteMany({ _id: { $in: descendantCareerpostIds } });

        // Update User model
        await User.updateMany(
            { _id: { $in: Array.from(uniqueAuthorIds) } },
            { $pull: { careerposts: { $in: descendantCareerpostIds } } }
        );

        // Update Company model
        await Company.updateMany(
            { _id: { $in: Array.from(uniqueCompanyIds) } },
            { $pull: { careerposts: { $in: descendantCareerpostIds } } }
        );

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to delete careerpost: ${error.message}`);
    }
}

export async function fetchCareerpostById(careerpostId: string) {
    connectToDB();

    try {
        const careerpost = await Careerpost.findById(careerpostId)
            .populate({
                path: "author",
                model: User,
                select: "_id id name image",
            }) // Populate the author field with _id and username
            .populate({
                path: "company",
                model: Company,
                select: "_id id name image",
            }) // Populate the company field with _id and name
            .populate({
                path: "children", // Populate the children field
                populate: [
                    {
                        path: "author", // Populate the author field within children
                        model: User,
                        select: "_id id name parentId image", // Select only _id and username fields of the author
                    },
                    {
                        path: "children", // Populate the children field within children
                        model: Careerpost, // The model of the nested children (assuming it's the same "Careerpost" model)
                        populate: {
                            path: "author", // Populate the author field within nested children
                            model: User,
                            select: "_id id name parentId image", // Select only _id and username fields of the author
                        },
                    },
                    {
                        path: "likedBy", // Populate the likedBy field within children
                        model: User,
                        select: "id name image", // Select only _id and username fields of the likedBy
                    }
                ],
            })
            .populate({
                path: "likedBy",
                model: User,
                select: "id name image",
            })
            .exec();

        return careerpost;
    } catch (err) {
        console.error("Error while fetching careerpost:", err);
        throw new Error("Unable to fetch careerpost");
    }
}

export async function addCommentToCareerpost(
    careerpostId: string,
    commentText: string,
    userId: string,
    path: string
) {
    connectToDB();

    try {
        // Find the original careerpost by its ID
        const originalCareerpost = await Careerpost.findById(careerpostId);

        if (!originalCareerpost) {
            throw new Error("Careerpost not found");
        }

        // Create the new comment careerpost
        const commentCareerpost = new Careerpost({
            text: commentText,
            author: userId,
            parentId: careerpostId, // Set the parentId to the original careerpost's ID
        });

        // Save the comment careerpost to the database
        const savedCommentCareerpost = await commentCareerpost.save();

        // Add the comment careerpost's ID to the original careerpost's children array
        originalCareerpost.children.push(savedCommentCareerpost._id);

        // Save the updated original careerpost to the database
        await originalCareerpost.save();

        revalidatePath(path);
    } catch (err) {
        console.error("Error while adding comment:", err);
        throw new Error("Unable to add comment");
    }
}

export async function addLike(careerpostId: string, currentUserId: string, path: string) {
    connectToDB();
    try {
        const careerpost = await Careerpost.findById(careerpostId);
        const currentUserInfo = await fetchUser(currentUserId);
        if (!careerpost) {
            throw new Error("Careerpost not found");
        }
       
        await careerpost.updateOne({ $addToSet: { likedBy: currentUserInfo._id } });
        
        revalidatePath(path);
    } catch (err) {
        console.error("Error while adding like:", err);
        throw new Error("Unable to add like");
    }
}

export async function deleteLike(careerpostId: string, currentUserId: string, path: string) {
    connectToDB();
    try {
        const careerpost = await Careerpost.findById(careerpostId);
        const currentUserInfo = await fetchUser(currentUserId);

        if (!careerpost) {
            throw new Error("Careerpost not found");
        }
        // await User.updateOne({ _id: currentUserId }, { $pull: { likedPosts: careerpostId } });
        await careerpost.updateOne({ $pull: { likedBy: currentUserInfo._id } });

        revalidatePath(path);
    } catch (err) {
        console.error("Error while deleting like:", err);
        throw new Error("Unable to delete like");
    }
}

export async function isLikedByUser(careerpostId: string, currentUserId: string) {
    connectToDB();
    try {
        const careerpost = await Careerpost.findById(careerpostId);
        const currentUserInfo = await fetchUser(currentUserId);
        if (!careerpost) {
            throw new Error("Careerpost not found");
        }
        const isLiked = careerpost.likedBy.includes(currentUserInfo._id);
        return isLiked
    } catch (err) {
        console.error("Error while checking like:", err);
        throw new Error("Unable to check like");
    }
}