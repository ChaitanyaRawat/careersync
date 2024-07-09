import CompanyProfile from "@/components/forms/CompanyProfile";
import { fetchCompanyDetails } from "@/lib/actions/company.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const page = async ({ params }: { params: { id: string } }) => {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");
    const companyDetails = await fetchCompanyDetails(params.id);
    if(!companyDetails) redirect("/");
    return (
        <div>
            <h1 className='head-text'>Edit Organization bio and URL</h1>
            <p className='mt-3 text-base-regular text-gray-700'>Make any changes</p>
            <CompanyProfile orgInfo={JSON.stringify(companyDetails)}/>
        </div>
    )
}

export default page