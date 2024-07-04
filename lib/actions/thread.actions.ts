"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";

import User from "../models/user.model";
import Thread from "../models/thread.model";
import Community from "../models/community.model";
import { UTApi } from "uploadthing/server";
import { fetchUser } from "./user.actions";

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    connectToDB();

    // Calculate the number of posts to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a query to fetch the posts that have no parent (top-level threads) (a thread that is not a comment/reply).
    const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
        .sort({ createdAt: "desc" })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({
            path: "author",
            model: User,
        })
        .populate({
            path: "community",
            model: Community,
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

    // Count the total number of top-level posts (threads) i.e., threads that are not comments.
    const totalPostsCount = await Thread.countDocuments({
        parentId: { $in: [null, undefined] },
    }); // Get the total count of posts

    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };
}

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
    tags: string[],
    urls: string[],
    attachment: string | null | undefined,
}

export async function createThread({ text, author, communityId, path, tags, urls, attachment }: Params
) {
    try {
        connectToDB();

        const communityIdObject = await Community.findOne(
            { id: communityId },
            { _id: 1 }
        );

        const createdThread = await Thread.create({
            text,
            author,
            community: communityIdObject, // Assign communityId if provided, or leave it null for personal account
            likedBy: [],
            tags: tags,
            urls: urls,
            attachment: ((attachment !== undefined && attachment !== "") ? attachment : null),
        });

        // Update User model
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id },
        });

        if (communityIdObject) {
            // Update Community model
            await Community.findByIdAndUpdate(communityIdObject, {
                $push: { threads: createdThread._id },
            });
        }

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to create thread: ${error.message}`);
    }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
    const childThreads = await Thread.find({ parentId: threadId });

    const descendantThreads = [];
    for (const childThread of childThreads) {
        const descendants = await fetchAllChildThreads(childThread._id);
        descendantThreads.push(childThread, ...descendants);
    }

    return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
    try {
        const utapi = new UTApi();
        connectToDB();

        // Find the thread to be deleted (the main thread)
        const mainThread = await Thread.findById(id).populate("author community");
        if (mainThread.attachment) {
            const fileId = mainThread.attachment.substring(18);
            // console.log("fileId = ", fileId);

            await utapi.deleteFiles(fileId);
        }

        if (!mainThread) {
            throw new Error("Thread not found");
        }

        // Fetch all child threads and their descendants recursively
        const descendantThreads = await fetchAllChildThreads(id);

        // Get all descendant thread IDs including the main thread ID and child thread IDs
        const descendantThreadIds = [
            id,
            ...descendantThreads.map((thread) => thread._id),
        ];

        // Extract the authorIds and communityIds to update User and Community models respectively
        const uniqueAuthorIds = new Set(
            [
                ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainThread.author?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        const uniqueCommunityIds = new Set(
            [
                ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainThread.community?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        // Recursively delete child threads and their descendants
        await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

        // Update User model
        await User.updateMany(
            { _id: { $in: Array.from(uniqueAuthorIds) } },
            { $pull: { threads: { $in: descendantThreadIds } } }
        );

        // Update Community model
        await Community.updateMany(
            { _id: { $in: Array.from(uniqueCommunityIds) } },
            { $pull: { threads: { $in: descendantThreadIds } } }
        );

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to delete thread: ${error.message}`);
    }
}

export async function fetchThreadById(threadId: string) {
    connectToDB();

    try {
        const thread = await Thread.findById(threadId)
            .populate({
                path: "author",
                model: User,
                select: "_id id name image",
            }) // Populate the author field with _id and username
            .populate({
                path: "community",
                model: Community,
                select: "_id id name image",
            }) // Populate the community field with _id and name
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
                        model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
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

        return thread;
    } catch (err) {
        console.error("Error while fetching thread:", err);
        throw new Error("Unable to fetch thread");
    }
}

export async function addCommentToThread(
    threadId: string,
    commentText: string,
    userId: string,
    path: string
) {
    connectToDB();

    try {
        // Find the original thread by its ID
        const originalThread = await Thread.findById(threadId);

        if (!originalThread) {
            throw new Error("Thread not found");
        }

        // Create the new comment thread
        const commentThread = new Thread({
            text: commentText,
            author: userId,
            parentId: threadId, // Set the parentId to the original thread's ID
        });

        // Save the comment thread to the database
        const savedCommentThread = await commentThread.save();

        // Add the comment thread's ID to the original thread's children array
        originalThread.children.push(savedCommentThread._id);

        // Save the updated original thread to the database
        await originalThread.save();

        revalidatePath(path);
    } catch (err) {
        console.error("Error while adding comment:", err);
        throw new Error("Unable to add comment");
    }
}

export async function addLike(threadId: string, currentUserId: string, path: string) {
    connectToDB();
    try {
        const thread = await Thread.findById(threadId);
        const currentUserInfo = await fetchUser(currentUserId);
        if (!thread) {
            throw new Error("Thread not found");
        }
        // await User.updateOne({ _id: currentUserId }, { $addToSet: { likedPosts: threadId } });
        await thread.updateOne({ $addToSet: { likedBy: currentUserInfo._id } });
        // console.log("Added like to thread:", threadId);
        revalidatePath(path);
    } catch (err) {
        console.error("Error while adding like:", err);
        throw new Error("Unable to add like");
    }
}

export async function deleteLike(threadId: string, currentUserId: string, path: string) {
    connectToDB();
    try {
        const thread = await Thread.findById(threadId);
        const currentUserInfo = await fetchUser(currentUserId);

        if (!thread) {
            throw new Error("Thread not found");
        }
        // await User.updateOne({ _id: currentUserId }, { $pull: { likedPosts: threadId } });
        await thread.updateOne({ $pull: { likedBy: currentUserInfo._id } });

        revalidatePath(path);
    } catch (err) {
        console.error("Error while deleting like:", err);
        throw new Error("Unable to delete like");
    }
}

export async function isLikedByUser(threadId: string, currentUserId: string) {
    connectToDB();
    try {
        const thread = await Thread.findById(threadId);
        const currentUserInfo = await fetchUser(currentUserId);
        if (!thread) {
            throw new Error("Thread not found");
        }
        const isLiked = thread.likedBy.includes(currentUserInfo._id);
        return isLiked
    } catch (err) {
        console.error("Error while checking like:", err);
        throw new Error("Unable to check like");
    }
}