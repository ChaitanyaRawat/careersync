"use client";
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { useOrganization } from '@clerk/nextjs';

const CreateJobOpeningBtn = ({orgId}: {orgId: string}) => {
    const router = useRouter()
    const { organization }  = useOrganization()
    if(!organization) return null
    const currentUserOrganisationId = organization.id
    if(orgId !== currentUserOrganisationId) return null
    // console.log("organizationId = ", organizationId)
    return (
        <Button className='user-card_btn font-bold' onClick={() => router.push(`/communities/${orgId}/create-job-opening`)}>
            Create
        </Button>
            // href={`/communities/${organizationId}/create-job-opening`}
            // className='user-card_btn'
    
    )
}

export default CreateJobOpeningBtn