import JobOpeningCard from "@/components/cards/JobOpeningCard";
import JobSearchbar from "@/components/shared/JobSearchbar";
import Pagination from "@/components/shared/Pagination";
import { fetchAllJobOpenings, fetchCompanyDetails } from "@/lib/actions/company.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


const page = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");



    const skills: string[] | undefined = searchParams?.skills?.split(",").map(decodeURIComponent)
    const q: string | undefined = decodeURIComponent(searchParams?.q || "")



    const result = await fetchAllJobOpenings(
        searchParams.page ? +searchParams.page : 1,
        30,
        q,
        (skills?.length === 1 && skills[0] === "" ? [] : skills)
    )


    return (
        <>
            <h1 className='head-text text-left'>Job Openings</h1>
            <p className="mb-4">Explore all the latest opportunities</p>
            <JobSearchbar routeType="job-openings" />
            <section className='mt-9 flex flex-col gap-10'>
                {result.opportunities.length === 0 ? (
                    <p className='no-result'>No careerposts found</p>
                ) : (
                    <>
                        {result.opportunities.map(async (curr) => {
                            const orgInfo = await fetchCompanyDetails(curr.organisationId)

                            return (
                                <JobOpeningCard
                                    oid={curr._id}
                                    orgId={orgInfo.id}
                                    orgName={orgInfo.name}
                                    orgImage={orgInfo.image}
                                    createdAt={curr.createdAt}
                                    creatorId={curr.createdBy.id}
                                    creatorName={curr.createdBy.name}
                                    creatorImage={curr.createdBy.image}
                                    title={curr.title}
                                    description={curr.description}
                                    demandedSkills={curr.demandedSkills}
                                    attachment={curr.attachment}
                                    urls={curr.urls}
                                    showBtn={true}
                                />
                            )
                        })}
                    </>
                )}
            </section>

            <Pagination
                path='/job-openings'
                pageNumber={searchParams?.page ? +searchParams.page : 1}
                isNext={result.isNext}
            />
        </>
    )
}

export default page