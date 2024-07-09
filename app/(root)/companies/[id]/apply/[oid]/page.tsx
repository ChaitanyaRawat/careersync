import JobOpeningCard from "@/components/cards/JobOpeningCard";
import JobApplicationForm from "@/components/forms/JobApplicationForm";
import RevokeApplication from "@/components/shared/RevokeApplication";
import { Button } from "@/components/ui/button";
import { fetchCompanyDetails, revokeApplication, userHasAppliedForJobOpening } from "@/lib/actions/company.actions"
import { fetchJobOpeningById } from "@/lib/actions/company.actions"
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const page = async ({ params }: { params: { oid: string, id: string } }) => {
    const user = await currentUser();
    if (!user) return null; // to avoid typescript warnings

    const userInfo = await fetchUser(user.id);
    
    if (!userInfo.onboarded) { redirect("/onboarding") };

    const companyDetails = await fetchCompanyDetails(params.id);
    const jobOpening = await fetchJobOpeningById(params.oid);
    const hasApplied = await userHasAppliedForJobOpening({ userId: userInfo._id, oid: params.oid });
   
    return (
        <>
            <h1 className="head-text mb-4">Apply to <span className="text-primary-500">{companyDetails.name}</span></h1>
            <JobOpeningCard
                oid={jobOpening._id}
                orgId={params.id}
                orgName={companyDetails.name}
                orgImage={companyDetails.image}
                createdAt={jobOpening.createdAt}
                creatorId={jobOpening.createdBy.id}
                creatorName={jobOpening.createdBy.name}
                creatorImage={jobOpening.createdBy.image}
                title={jobOpening.title}
                description={jobOpening.description || ""}
                demandedSkills={jobOpening.demandedSkills || []}
                attachment={jobOpening.attachment || ""}
                urls={jobOpening.urls || []}
                showBtn={false}
            />
            {
                !hasApplied?.status
                    ? (<JobApplicationForm orgId={params.id} oid={params.oid} userOid={JSON.stringify(userInfo._id)} />)
                    : (
                        <>
                            
                            <RevokeApplication params={JSON.stringify(params)} userInfo={JSON.stringify(userInfo)} hasApplied={JSON.stringify(hasApplied)} />
                        </>
                    )
            }
        </>
    )
}

export default page