"use client"

import { useRouter } from 'next/navigation';
import { useOrganization } from '@clerk/nextjs';

import  Link  from 'next/link';

const CheckApplicationsBtn = ({ orgId, oid }: { orgId: string, oid: string })  => {
    const router = useRouter()
    const { organization } = useOrganization()
   
    if (!organization) return null
    const currentUserOrganisationId = organization.id

    if (orgId !== currentUserOrganisationId) return null
    return (
     <Link 
     href={`/companies/${orgId}/applications/${oid}`} 
     className='bg-primary-500 px-8 py-2 text-light-1 rounded-lg my-4 text-center font-bold hover:bg-black'
     >
        Check Applications
     </Link>
    )
}

export default CheckApplicationsBtn