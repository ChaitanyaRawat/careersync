import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import PostCareerpost from "@/components/forms/PostCareerpost";
import { fetchUser } from "@/lib/actions/user.actions";

async function Page() {
    const user = await currentUser();
    if (!user) return null;

    // fetch organization list created by user
    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    return (
        <>
            <h1 className='head-text'>Create a New Post</h1>

            <PostCareerpost userId={userInfo._id} />
        </>
    );
}

export default Page;