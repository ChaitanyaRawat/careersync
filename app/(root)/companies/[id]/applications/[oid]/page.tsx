import ViewApplications from "@/components/shared/ViewApplications";
import { fetchApplicationsForJobOpening } from "@/lib/actions/company.actions"


import { currentUser } from "@clerk/nextjs/server";


const page = async ({ params }: { params: { oid: string, id: string } }) => {
 
    const user = await currentUser();
    if (!user) return null;
   
   

    const applications: any = await fetchApplicationsForJobOpening(params.oid)
    return (

        
        <>
        <ViewApplications applications={JSON.stringify(applications)} oid={params.oid} orgId={params.id} />
        </>
    )
}

export default page