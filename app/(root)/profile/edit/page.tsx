import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { fetchUser } from "@/lib/actions/user.actions";
import AccountProfile from "@/components/forms/AccountProfile";

// Copy paste most of the code as it is from the /onboarding

async function Page() {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    const skillSet = [];
    // iterate over each element in userInfo.skillSet
    for (let i = 0; i < userInfo?.skillSet.length; i++) {


        skillSet.push({
            skillName: userInfo?.skillSet[i].skillName,
            credentials: userInfo?.skillSet[i].credentials
        });
    }

    // console.log("skillset = ", skillSet)
    const userData = {
        id: user.id,
        objectId: userInfo?._id,
        username: userInfo ? userInfo?.username : user.username,
        name: userInfo ? userInfo?.name : user.firstName ?? "",
        bio: userInfo ? userInfo?.bio : "",
        image: userInfo ? userInfo?.image : user.imageUrl,
        // skillSet: userInfo?.skillSet,

    };

    return (
        <>
            <h1 className='head-text'>Edit Profile</h1>
            <p className='mt-3 text-base-regular text-gray-700'>Make any changes</p>

            <section className='mt-12'>
                <AccountProfile user={userData} btnTitle='Continue' userSkillSet={skillSet} />
            </section>
        </>
    );
}

export default Page;