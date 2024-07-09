import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Searchbar from "@/components/shared/Searchbar";
import Pagination from "@/components/shared/Pagination";
import CompanyCard from "@/components/cards/CompanyCard";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchCompanies } from "@/lib/actions/company.actions";

async function Page({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    const result = await fetchCompanies({
        searchString: searchParams.q,
        pageNumber: searchParams?.page ? +searchParams.page : 1,
        pageSize: 25,
    });

    return (
        <>
            <h1 className='head-text'>Companies</h1>

            <div className='mt-5'>
                <Searchbar routeType='companies' />
            </div>

            <section className='mt-9 flex flex-wrap gap-4'>
                {result.companies.length === 0 ? (
                    <p className='no-result'>No Result</p>
                ) : (
                    <>
                        {result.companies.map((company) => (
                            <CompanyCard
                                key={company.id}
                                id={company.id}
                                name={company.name}
                                username={company.username}
                                imgUrl={company.image}
                                bio={company.bio}
                                members={company.members}
                            />
                        ))}
                    </>
                )}
            </section>

            <Pagination
                path='companies'
                pageNumber={searchParams?.page ? +searchParams.page : 1}
                isNext={result.isNext}
            />
        </>
    );
}

export default Page;