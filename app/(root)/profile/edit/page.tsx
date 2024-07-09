import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { fetchUser } from "@/lib/actions/user.actions";
import AccountProfile, { experience, qualification } from "@/components/forms/AccountProfile";

// Copy paste most of the code as it is from the /onboarding

async function Page() {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");
    // const qualifications:qualification[]=[]


    const skillSet = [];
    // iterate over each element in userInfo.skillSet
    for (let i = 0; i < userInfo?.skillSet.length; i++) {


        skillSet.push({
            skillName: userInfo?.skillSet[i].skillName,
            credentials: userInfo?.skillSet[i].credentials
        });
    }

    const qualifications: qualification[] = []
    for (let i = 0; i < userInfo?.qualifications.length; i++) {
        qualifications.push({
            name: userInfo?.qualifications[i].name,
            credentialUrl: userInfo?.qualifications[i].credentialUrl,
            issuingAuthority: userInfo?.qualifications[i].issuingAuthority
        })
    }

    const experiences: experience[] = []
    for (let i = 0; i < userInfo?.experiences.length; i++) {
        experiences.push({
            companyName: userInfo?.experiences[i].companyName,
            position: userInfo?.experiences[i].position,
            from: userInfo?.experiences[i].from,
            to: userInfo?.experiences[i].to,
            description: userInfo?.experiences[i].description,
            credential: userInfo?.experiences[i].credential
        })
    }
  
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
                <AccountProfile
                    user={userData}
                    btnTitle='Save changes'
                    userSkillSet={skillSet}
                    qualifications={qualifications}
                    contactInfo={userInfo?.contactInfo}
                    experiences={JSON.stringify(experiences)}
                />
            </section>
        </>
    );
}

export default Page;