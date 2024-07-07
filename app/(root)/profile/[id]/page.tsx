import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { profileTabs } from "@/constants";

import ThreadsTab from "@/components/shared/ThreadsTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { fetchUser } from "@/lib/actions/user.actions";
import SkillTab from "@/components/shared/SkillTab";
import QualificationTab from "@/components/shared/QualificationTab";
import ExperiencesTab from "@/components/shared/ExperiencesTab";
import { experience } from "@/components/forms/AccountProfile";
// import SkillForm from "@/components/forms/SkillForm";

async function Page({ params }: { params: { id: string } }) {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(params.id);
    if (!userInfo?.onboarded) redirect("/onboarding");
    // console.log("userInfo = ", userInfo);
    const skillSet = [];
    // iterate over each element in userInfo.skillSet
    for (let i = 0; i < userInfo?.skillSet.length; i++) {


        skillSet.push({
            skillName: userInfo?.skillSet[i].skillName,
            credentials: userInfo?.skillSet[i].credentials
        });
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


    return (
        <section>


            <ProfileHeader
                accountId={userInfo.id}
                authUserId={user.id}
                name={userInfo.name}
                username={userInfo.username}
                imgUrl={userInfo.image}
                bio={userInfo.bio}
            />

            <div className='mt-9'>
                <Tabs defaultValue='skills' className='w-full'>



                    <TabsList className='tab'>
                        {profileTabs.map((tab) => (
                            <TabsTrigger key={tab.label} value={tab.value} className='tab' >
                                <Image
                                    src={tab.icon}
                                    alt={tab.label}
                                    width={24}
                                    height={24}
                                    className='object-contain'
                                />
                                <p className='max-sm:hidden'>{tab.label}</p>

                                {tab.label === "Threads" && (
                                    <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'>
                                        {userInfo.threads.length}
                                    </p>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>





                    <TabsContent

                        value="posts"
                        className='w-full text-black'
                    >
                        {/* @ts-ignore */}
                        <ThreadsTab
                            currentUserId={user.id}
                            accountId={userInfo.id}
                            accountType='User'
                        />
                    </TabsContent>



                    <TabsContent
                        value="skills"
                        className="w-full text-black"
                    >
                        <SkillTab skills={skillSet} />

                    </TabsContent>


                    <TabsContent
                        value="qualifications"
                        className="w-full text-black"
                    >

                        <QualificationTab qualifications={userInfo?.qualifications} />
                    </TabsContent>

                    <TabsContent
                        value="experience"
                        className="w-full text-black"
                    >
                        <ExperiencesTab userExperiences={JSON.stringify(experiences)} />

                    </TabsContent>

                    <TabsContent
                        value="contactInfo"
                        className="w-full text-black"
                    >
                        <div className='w-full flex flex-col p-2 gap-4 rounded-lg my-2'>

                            {userInfo.contactInfo.email && userInfo.contactInfo.email !== "" &&

                                <div className="flex flex-col md:flex-row w-full items-center gap-3 border-black bg-white p-3 rounded-lg ">
                                    <div className='relative h-11 w-11'>
                                        <Image
                                            src="/assets/email.svg"
                                            alt='email'
                                            fill
                                            className='cursor-pointer rounded-full'
                                        />
                                    </div>
                                    <h2 className=' text-black text-heading3-bold'>
                                        Email
                                    </h2>
                                    <a href={`mailto:${userInfo.contactInfo.email}`} target="_blank" className='text-base-medium text-blue'>
                                        {userInfo.contactInfo.email}
                                    </a>
                                </div>
                            }


                            {userInfo.contactInfo.phone && userInfo.contactInfo.phone !== "" &&

                                <div className="flex flex-col md:flex-row w-full items-center gap-3 border-black bg-white p-3 rounded-lg ">
                                    <div className='relative h-11 w-11'>
                                        <Image
                                            src="/assets/phone.svg"
                                            alt='email'
                                            fill
                                            className='cursor-pointer rounded-full'
                                        />
                                    </div>
                                    <h2 className=' text-black text-heading3-bold'>
                                        Phone
                                    </h2>
                                    <p className='text-base-medium text-gray-1'>
                                        {userInfo.contactInfo.phone}
                                    </p>
                                </div>
                            }

                            {userInfo.contactInfo.whatsapp && userInfo.contactInfo.whatsapp !== "" &&

                                <div className="flex flex-col md:flex-row w-full items-center gap-3 border-black bg-white p-3 rounded-lg ">
                                    <div className='relative h-11 w-11'>
                                        <Image
                                            src="/assets/whatsapp.svg"
                                            alt='email'
                                            fill
                                            className='cursor-pointer rounded-full'
                                        />
                                    </div>
                                    <h2 className=' text-black text-heading3-bold'>
                                        Whatsapp
                                    </h2>
                                    <p className='text-base-medium text-gray-1'>
                                        {userInfo.contactInfo.whatsapp}
                                    </p>
                                </div>
                            }

                            {userInfo.contactInfo.github && userInfo.contactInfo.github !== "" &&

                                <div className="flex flex-col md:flex-row w-full items-center gap-3 border-black bg-white p-3 rounded-lg ">
                                    <div className='relative h-11 w-11'>
                                        <Image
                                            src="/assets/github.svg"
                                            alt='email'
                                            fill
                                            className='cursor-pointer rounded-full'
                                        />
                                    </div>
                                    <h2 className=' text-black text-heading3-bold'>
                                        Github
                                    </h2>
                                    <a href={userInfo.contactInfo.github} target="_blank" className='text-base-medium text-blue'>
                                        {userInfo.contactInfo.github}
                                    </a>
                                </div>
                            }





                        </div>

                    </TabsContent>



                </Tabs>
            </div>
        </section>
    );
}
export default Page;