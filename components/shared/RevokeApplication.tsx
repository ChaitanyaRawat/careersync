"use client"
import { revokeApplication } from '@/lib/actions/community.actions'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import Loader from './Loader'

const RevokeApplication = ({ params, userInfo, hasApplied }: { params: any, userInfo: any, hasApplied: any }) => {
    const [isLoading, setisLoading] = useState<boolean>(false)
    const router = useRouter()
    const jParams = JSON.parse(params)
    const jUserInfo = JSON.parse(userInfo)
    const jHasApplied = JSON.parse(hasApplied)

    return (
        <div className={`max-w-[100%] h-[600px] flex flex-col justify-center items-center my-4 bg-white rounded-lg p-4 gap-2`}>
            <p className="text-green-500">You have already applied to this job opening.</p>
            <iframe src={jHasApplied.application.resume} width="100%" className={`max-w-[80%] h-full `} />
            <Button
                className="bg-red-600 text-white font-bold"
                onClick={async () => {
                    setisLoading(true)
                    await revokeApplication({ oid: jParams.oid, userOid: jUserInfo._id })
                    router.push(`/communities/${jParams.id.toString()}`)
                    setisLoading(false)
                }}
            >
                Revoke
            </Button>
            {
                isLoading && <Loader />
            }
        </div>
    )
}

export default RevokeApplication