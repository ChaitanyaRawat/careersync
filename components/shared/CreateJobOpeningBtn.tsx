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

    return (
        <Button className='user-card_btn font-bold' onClick={() => router.push(`/companies/${orgId}/create-job-opening`)}>
            Create
        </Button>
        
    
    )
}

export default CreateJobOpeningBtn