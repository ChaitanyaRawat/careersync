"use client";

import Link from "next/link";
import Image from "next/image";
import { useOrganization } from "@clerk/nextjs";

interface Props {
    accountId: string;
    authUserId: string;
    name: string;
    username: string;
    imgUrl: string;
    bio: string;
    type?: string;
    orgId?: string;
    websiteUrl?: string;
}

function ProfileHeader({
    accountId,
    authUserId,
    name,
    username,
    imgUrl,
    bio,
    type,
    orgId,
    websiteUrl,
}: Props) {
    const { organization } = useOrganization();
   
    return (
        <div className='flex w-full flex-col justify-start overflow-auto'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <div className='relative h-20 w-20 object-cover'>
                        <Image
                            src={imgUrl}
                            alt='logo'
                            fill
                            className='rounded-full object-cover shadow-2xl'
                        />
                    </div>

                    <div className='flex-1'>
                        <h2 className='text-left text-heading3-bold text-black'>
                            {name}
                        </h2>
                        <p className='text-base-medium text-gray-1'>@{username}</p>
                    </div>
                </div>
                {accountId === authUserId && type !== "Company" && (
                    <Link href='/profile/edit'>
                        <div className='flex cursor-pointer gap-3 rounded-lg bg-white px-4 py-2'>
                            <Image
                                src='/assets/edit.svg'
                                alt='logout'
                                width={16}
                                height={16}
                            />

                            <p className='text-black max-sm:hidden font-bold'>Edit</p>
                        </div>
                    </Link>
                )}
                {type === "Company" && organization?.id === orgId && (
                    <Link href={`/companies/${orgId}/edit`}>
                        <div className='flex cursor-pointer gap-3 rounded-lg bg-white px-4 py-2'>
                            <Image
                                src='/assets/edit.svg'
                                alt='logout'
                                width={16}
                                height={16}
                            />

                            <p className='text-black max-sm:hidden'>Edit</p>
                        </div>
                    </Link>
                )

                }
            </div>

            <p className='mt-6 max-w-lg text-base-regular text-black'>{bio}</p>

            {websiteUrl && (
                <a
                    href={websiteUrl}
                    target='_blank'

                    className='mt-6 text-base-regular text-blue overflow-auto'
                >
                    {websiteUrl}
                </a>
            )}

            <div className='mt-12 h-0.5 w-full bg-gray-300' />
        </div>
    );
}

export default ProfileHeader;