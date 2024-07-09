"use client"

import { useOrganization } from "@clerk/nextjs"
import ApplicationCard from "../cards/ApplicationCard"


const ViewApplications = ({ applications, oid, orgId }: { applications: string, oid: string, orgId: string }) => {
    const { organization } = useOrganization()
  
    if (!organization) return null
    const currentUserOrganisationId = organization.id

    if (orgId !== currentUserOrganisationId) return (<p className='text-red-500'>You are not allowed to view applications</p>)
    const applicationsRecieved = JSON.parse(applications)
    
    return (
        <>
        {
            applicationsRecieved.length === 0 
            ? (<p className='text-black'>No applications received yet</p> )
            : (
                <>
                     {
                        applicationsRecieved.map((application: any) => (
                            // <p key={application.candidate.id}>{application.candidate.name}</p>
                            <ApplicationCard key={application.candidate.id} oid={oid} userOid={application.candidate._id}  userImage={application.candidate.image} name={application.candidate.name} resume={application.resume} clerkId={application.candidate.id} accepted={application.accepted} />
                        ))
                     }
                </>
            )
        }
        </>
    )
}

export default ViewApplications