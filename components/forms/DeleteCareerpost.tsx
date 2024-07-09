"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { deleteCareerpost } from "@/lib/actions/careerpost.actions";

interface Props {
    careerpostId: string;
    currentUserId: string;
    authorId: string;
    parentId: string | null;
    isComment?: boolean;
}

function DeleteCareerpost({
    careerpostId,
    currentUserId,
    authorId,
    parentId,
    isComment,
}: Props) {
    const pathname = usePathname();
    const router = useRouter();

    if (currentUserId !== authorId || pathname === "/") return null;

    return (
        <Image
            src='/assets/delete.svg'
            alt='delte'
            width={18}
            height={18}
            className='cursor-pointer object-contain'
            onClick={async () => {
                await deleteCareerpost(JSON.parse(careerpostId), pathname);
                if (!parentId || !isComment) {
                    router.push("/");
                }
            }}
        />
    );
}

export default DeleteCareerpost;