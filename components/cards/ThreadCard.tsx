import Image from "next/image";
import Link from "next/link";

import { formatDateString } from "@/lib/utils";
import DeleteThread from "../forms/DeleteThread";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";
import LikeButton from "../forms/LikeButton";
import { isLikedByUser } from "@/lib/actions/thread.actions";


interface Props {
    id: string;
    currentUserId: string;
    parentId: string | null;
    content: string;
    author: {
        name: string;
        image: string;
        id: string;
    };
    community: {
        id: string;
        name: string;
        image: string;
    } | null;
    createdAt: string;
    comments: {
        author: {
            image: string;
        };
    }[];
    isComment?: boolean;
    tags: string[];
    urls: string[];
    attachment: string | null | undefined;
    likedBy:{
        id: string;
        name: string;
        image: string;
    }[]
}

async function ThreadCard({
    id,
    currentUserId,
    parentId,
    content,
    author,
    community,
    createdAt,
    comments,
    isComment,
    tags,
    urls,
    attachment,
    likedBy
}: Props) {
    const isLiked = await isLikedByUser(id, currentUserId)
    console.log("likedby = ", likedBy)
    return (
        <article
            className={`flex w-full flex-col bg-white   ${isComment ? "px-0 xs:px-7 my-4  py-4" : "p-7 rounded-xl"
                }`}
        >
            <div className='flex items-start justify-between'>
                <div className='flex w-full flex-1 flex-row gap-4'>
                    <div className='flex flex-col items-center'>
                        <Link href={`/profile/${author.id}`} className='relative h-11 w-11'>
                            <Image
                                src={author.image}
                                alt='user_community_image'
                                fill
                                className='cursor-pointer rounded-full'
                            />
                        </Link>

                        <div className='thread-card_bar' />
                    </div>

                    <div className='flex w-full flex-col'>
                        <Link href={`/profile/${author.id}`} className='w-fit'>
                            <h4 className='cursor-pointer text-base-semibold text-black'>
                                {author.name}
                            </h4>
                        </Link>
                        <p className='text-subtle-medium text-gray-1'>
                            {formatDateString(createdAt)}

                        </p>
                        {community && (
                            <Link
                                href={`/communities/${community.id}`}
                                className='mt-1 mb-5 flex items-center'
                            >
                                <p className='text-subtle-medium text-gray-1'>
                                    {community && `${community.name}`}
                                </p>

                                <Image
                                    src={community.image}
                                    alt={community.name}
                                    width={14}
                                    height={14}
                                    className='ml-1 rounded-full object-cover'
                                />
                            </Link>
                        )}

                        {/* {!isComment && community && (
                            <Link
                                href={`/communities/${community.id}`}
                                className='mt-1 mb-5 flex items-center'
                            >
                                <p className='text-subtle-medium text-gray-1'>
                                    {formatDateString(createdAt)}
                                    {community && ` - ${community.name} Community`}
                                </p>

                                <Image
                                    src={community.image}
                                    alt={community.name}
                                    width={14}
                                    height={14}
                                    className='ml-1 rounded-full object-cover'
                                />
                            </Link>
                        )} */}

                        <p className='my-4 text-small-regular text-dark-4'>{content}</p>


                        <div className="max-w-[100%]">
                            <Image src={attachment ? attachment : ""}
                                layout='responsive'
                                width={0}
                                height={0}
                                alt='icon'
                                className={`max-w-[100%] h-auto ${attachment ? "" : "hidden"}`}
                            />
                        </div>

                        <div className={`${isComment && "mb-10"} mt-5 flex flex-col gap-3`}>
                            {/* <div className='flex w-full gap-3.5'>
                                
                                <LikeButton threadId={id.toString()} currentUserId={currentUserId} isLiked={isLiked == true} />
                                    
                                <Link href={`/thread/${id}`} className="font-bold py-2 px-4 border-2 border-black rounded flex items-center gap-2 w-1/2 justify-center">
                            

                                        <Image
                                            src='/assets/reply.svg'
                                            alt='heart'
                                            width={24}
                                            height={24}
                                            className='cursor-pointer object-contain'
                                        />
                                        <span>comment</span>
                                    
                                </Link>
                            </div> */}


                            {/* {isComment && comments.length > 0 && (
                                <Link href={`/thread/${id}`}>
                                    <p className='mt-1 text-subtle-medium text-gray-1'>
                                        {comments.length} repl{comments.length > 1 ? "ies" : "y"}
                                    </p>
                                </Link>
                            )} */}
                        </div>
                    </div>
                </div>

                <DeleteThread
                    threadId={JSON.stringify(id)}
                    currentUserId={currentUserId}
                    authorId={author.id}
                    parentId={parentId}
                    isComment={isComment}
                />
            </div>

            {/* {!isComment && comments.length > 0 && (
                <div className='ml-1 mt-3 flex items-center gap-2'>
                    {comments.slice(0, 2).map((comment, index) => (
                        <Image
                            key={index}
                            src={comment.author.image}
                            alt={`user_${index}`}
                            width={24}
                            height={24}
                            className={`${index !== 0 && "-ml-5"} rounded-full object-cover`}
                        />
                    ))}

                    <Link href={`/thread/${id}`}>
                        <p className='mt-1 text-subtle-medium text-gray-1'>
                            {comments.length} repl{comments.length > 1 ? "ies" : "y"}
                        </p>
                    </Link>
                </div>
            )} */}

            {/* {!isComment && community && (
                <Link
                    href={`/communities/${community.id}`}
                    className='mt-5 flex items-center'
                >
                    <p className='text-subtle-medium text-gray-1'>
                        {formatDateString(createdAt)}
                        {community && ` - ${community.name} Community`}
                    </p>

                    <Image
                        src={community.image}
                        alt={community.name}
                        width={14}
                        height={14}
                        className='ml-1 rounded-full object-cover'
                    />
                </Link>
            )} */}
            <Accordion type="single" collapsible className="w-full">
                {urls.length > 0 && (
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-black">View Attached Urls</AccordionTrigger>
                        <AccordionContent className="pt-3 overflow-scroll">


                            {urls.length === 0 && <p className="text-black">No Urls Attached</p>}
                            {urls.map((url) => (
                                <a
                                    href={url}
                                    target="_blank"
                                    className="px-2 mx-1 py-1 rounded  text-primary-500 hover:bg-light-2 border border-black"
                                >
                                    {url}
                                </a>
                            ))}


                        </AccordionContent>
                    </AccordionItem>
                )}
                {
                    tags.length > 0 && (

                        <AccordionItem value="item-2">
                            <AccordionTrigger className="text-black">view tags</AccordionTrigger>
                            <AccordionContent className="pt-3 overflow-scroll">
                                {tags.length === 0 && <p className="text-black">No Tags Attached</p>}
                                {tags.map((curr) => (
                                    <Link
                                        href={`/tag/${curr}`}
                                        className="px-2 mx-1 py-1 rounded bg-gray-200/50 text-gray-700 hover:bg-gray-300"
                                    >
                                        {curr}
                                    </Link>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    )
                }

            </Accordion>
            <div className='flex w-full gap-3.5'>

                <LikeButton threadId={id.toString()} currentUserId={currentUserId} isLiked={isLiked == true} />

                <Link href={`/thread/${id}`} className="font-bold py-2 px-4 border-2 border-black rounded flex items-center gap-2 w-1/2 justify-center">


                    <Image
                        src='/assets/reply.svg'
                        alt='heart'
                        width={24}
                        height={24}
                        className='cursor-pointer object-contain'
                    />
                    <span className="text-black">comment</span>

                </Link>
            </div>
            {!isComment && comments.length > 0 && (
                <div className='ml-1 mt-6 flex items-center gap-2'>
                    {comments.slice(0, 2).map((comment, index) => (
                        <Image
                            key={index}
                            src={comment.author.image}
                            alt={`user_${index}`}
                            width={24}
                            height={24}
                            className={`${index !== 0 && "-ml-5"} rounded-full object-cover`}
                        />
                    ))}

                    <Link href={`/thread/${id}`}>
                        <p className='mt-1 text-subtle-medium text-gray-1'>
                            {comments.length} repl{comments.length > 1 ? "ies" : "y"}
                        </p>
                    </Link>
                </div>
            )}


            {
                !isComment && likedBy && likedBy.length > 0 && (
                    <div className='ml-1 mt-6 flex items-center gap-2'>
                        {likedBy.slice(0, 2).map((user, index) => (
                            <Image
                                key={index}
                                src={user.image}
                                alt={`user_${index}`}
                                width={24}
                                height={24}
                                className={`${index !== 0 && "-ml-5"} rounded-full object-cover`}
                            />
                        ))}

                        <Link href={`/thread/${id}/likes`}>
                            <p className='mt-1 text-subtle-medium text-gray-1'>
                                {likedBy.length} like{likedBy.length > 1 ? "s" : ""}
                            </p>
                        </Link>
                    </div>
                )
            }


            {isComment && comments.length > 0 && (
                <Link href={`/thread/${id}`} className="ml-1 mt-6">
                    <p className='mt-1 text-subtle-medium text-gray-1'>
                        {comments.length} repl{comments.length > 1 ? "ies" : "y"}
                    </p>
                </Link>
            )}
        </article>
    );
}

export default ThreadCard;