"use client"
import { useState } from "react"

import Image from "next/image"
import { addLike, deleteLike, isLikedByUser } from "@/lib/actions/careerpost.actions"
import { fetchUser } from "@/lib/actions/user.actions"

interface Props {
    careerpostId: string
    currentUserId: string
    isLiked: boolean
}

const LikeButton = ({ careerpostId, currentUserId, isLiked }: Props) => {

    const [likeState, setLikeState] = useState<boolean>(isLiked)
    

    const handleLike = async () => {
        let prev = likeState;
        setLikeState(!likeState)

        if (!prev) {
          
            await addLike(careerpostId, currentUserId, window.location.pathname)
        } else {
            await deleteLike(careerpostId, currentUserId, window.location.pathname)
        }
    }
    return (
        <>
            <button className={` font-bold py-2 px-4 border-2 ${likeState ? 'bg-primary-500' : 'border-black'}   rounded flex items-center gap-2 w-1/2 justify-center`} onClick={() => handleLike()}>
                <Image
                    src={`/assets/${likeState ? 'like' : 'not-liked'}.svg`}
                    alt='heart'
                    width={20}
                    height={20}
                    className='cursor-pointer object-contain fill-blue-500'
                />
                <span className={`text-lg ${likeState ? 'text-white' : 'text-black'}`}>{likeState ? 'Liked' : 'Like'}</span>
            </button>
        </>
    )
}

export default LikeButton