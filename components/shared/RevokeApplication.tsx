"use client"
import { revokeApplication } from '@/lib/actions/company.actions'
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
            <p className='font-bold'>Status: <span className={`${jHasApplied.application.accepted ? "text-green-500" : "text-primary-500"}`}>{jHasApplied.application.accepted ? "Accepted" : "Pending"}</span></p>
            { jHasApplied.application.accepted && <p className='font-bold'>You will be contacted soon by the employers</p>}
            <Button
                className="bg-red-600 text-white font-bold"
                onClick={async () => {
                    setisLoading(true)
                    await revokeApplication({ oid: jParams.oid, userOid: jUserInfo._id })
                    router.push(`/companies/${jParams.id.toString()}`)
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