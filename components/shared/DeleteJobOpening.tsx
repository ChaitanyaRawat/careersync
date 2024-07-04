"use client"
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { useOrganization } from '@clerk/nextjs';
import Image from 'next/image';
import { deleteJobOpening } from '@/lib/actions/community.actions';

const DeleteJobOpening = ({ orgId, oid }: { orgId: string, oid: string })  => {
    const router = useRouter()
    const { organization } = useOrganization()
    // console.log("orgId = ", orgId)
    // console.log("organization = ", organization)
    if (!organization) return null
    const currentUserOrganisationId = organization.id

    if (orgId !== currentUserOrganisationId) return null
    return (
        <Image
            src='/assets/delete.svg'
            alt='delete'
            width={18}
            height={18}
            className='cursor-pointer object-contain'
            onClick={async () => {
                await deleteJobOpening(JSON.parse(oid))
                //reload
                router.refresh()

            }}
        />
    )
}

export default DeleteJobOpening