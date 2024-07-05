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
import { Button } from "../ui/button";
import DeleteJobOpening from "../shared/DeleteJobOpening";
import mongoose from "mongoose";
import CheckApplicationsBtn from "../shared/CheckApplicationsBtn";


interface Props {
    oid: string,
    orgId: string,
    orgName: string,
    orgImage: string,
    createdAt: string,
    creatorId: string,
    creatorName: string,
    creatorImage: string,
    title: string,
    description: string,
    demandedSkills: string[],
    attachment: string,
    urls: string[],
    showBtn: boolean
}

function JobOpeningCard({
    oid,
    orgId,
    orgName,
    orgImage,
    createdAt,
    creatorId,
    creatorName,
    creatorImage,
    title,
    description,
    demandedSkills,
    attachment,
    urls,
    showBtn
}: Props) {


    return (
        <article
            className={`flex w-full flex-col bg-white   p-7 rounded-xl overflow-scroll`}
        >
            <div className='flex items-start justify-between'>
                <div className='flex w-full flex-1 flex-row gap-4'>
                    <div className='flex flex-col items-center'>
                        <Link href={`/communities/${orgId}`} className='relative h-11 w-11'>
                            <Image
                                src={orgImage}
                                alt='user_community_image'
                                fill
                                className='cursor-pointer rounded-full'
                            />
                        </Link>

                        <div className='thread-card_bar' />
                    </div>

                    <div className='flex w-full flex-col'>
                        <Link href={`/communities/${orgId}`} className='w-fit'>
                            <h4 className='cursor-pointer text-base-semibold text-black'>
                                {orgName}
                            </h4>
                        </Link>

                        <p className='text-subtle-medium text-gray-1 w-full'>
                            {formatDateString(createdAt)}

                        </p>
                        <p className='text-subtle-medium text-gray-1'>
                            Created by
                            {" "}<Link href={`/profile/${creatorId}`} className="font-bold text-primary-500">{creatorName}</Link>
                        </p>

                        <h1 className='text-center head-text text-black mt-8'>{title}</h1>

                        <p className='my-4 text-small-regular text-dark-4'>{description}</p>


                        <div className="max-w-[100%]">
                            <Image src={attachment ? attachment : ""}
                                layout='responsive'
                                width={0}
                                height={0}
                                alt='icon'
                                className={`max-w-[90%] h-auto ${attachment ? "" : "hidden"}`}
                            />
                        </div>


                    </div>
                </div>

                <DeleteJobOpening orgId={orgId} oid={JSON.stringify(oid)} />
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

                {demandedSkills.length > 0 && (
                    <AccordionItem value="item-2">
                        <AccordionTrigger className="text-black">Demanded Skills</AccordionTrigger>
                        <AccordionContent className="pt-3 overflow-scroll">
                            {demandedSkills.length === 0 && <p className="text-black">No Skills required</p>}
                            {demandedSkills.map((skill) => (
                                <div
                                    className="px-2 mx-1 py-1 rounded inline text-black hover:bg-light-2 border border-black"
                                >
                                    {skill}
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                )}


            </Accordion>


            {/* add a button to apply for job */}

            {showBtn && (
                <Link
                    href={`/communities/${orgId}/apply/${oid}`}
                    className='bg-primary-500 mt-5 text-white p-2 font-bold text-center rounded-lg hover:bg-black'>
                    Apply
                </Link>
            )
            }
            <CheckApplicationsBtn orgId={orgId} oid={oid} />






        </article>
    );
}

export default JobOpeningCard;