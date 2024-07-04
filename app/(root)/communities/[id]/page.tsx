import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";

import { communityTabs } from "@/constants";

import UserCard from "@/components/cards/UserCard";
import ThreadsTab from "@/components/shared/ThreadsTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { fetchCommunityDetails, fetchJobOpeningOfOrganisation } from "@/lib/actions/community.actions";

import { Link } from "lucide-react";
import CreateJobOpeningBtn from "@/components/shared/CreateJobOpeningBtn";
import JobOpeningCard from "@/components/cards/JobOpeningCard";

async function Page({ params }: { params: { id: string } }) {
    const communityId = params.id

    const user = await currentUser();
    if (!user) return null;



    const communityDetails = await fetchCommunityDetails(params.id);
    // console.log("communityDetails = ", communityDetails);
    const jobOpenings = await fetchJobOpeningOfOrganisation(communityId);
    // console.log("jobOpenings = ", jobOpenings);

    return (
        <section>
            <ProfileHeader
                accountId={communityDetails.createdBy.id}
                authUserId={user.id}
                name={communityDetails.name}
                username={communityDetails.username}
                imgUrl={communityDetails.image}
                bio={communityDetails.bio}
                type='Community'
            />

            <div className='mt-9'>
                <Tabs defaultValue='threads' className='w-full'>
                    <TabsList className='tab'>
                        {communityTabs.map((tab) => (
                            <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                                <Image
                                    src={tab.icon}
                                    alt={tab.label}
                                    width={24}
                                    height={24}
                                    className='object-contain'
                                />
                                <p className='max-sm:hidden'>{tab.label}</p>

                                {/* {tab.label === "Threads" && (
                                    <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'>
                                        {communityDetails.threads.length}
                                    </p>
                                )} */}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value='threads' className='w-full text-light-1'>
                        {/* @ts-ignore */}
                        <ThreadsTab
                            currentUserId={user.id}
                            accountId={communityDetails._id}
                            accountType='Community'
                        />
                    </TabsContent>

                    <TabsContent value='members' className='mt-9 w-full text-light-1'>
                        <section className='mt-9 flex flex-col gap-10'>
                            {communityDetails.members.map((member: any) => (
                                <UserCard
                                    key={member.id}
                                    id={member.id}
                                    name={member.name}
                                    username={member.username}
                                    imgUrl={member.image}
                                    personType='User'
                                />
                            ))}
                        </section>
                    </TabsContent>

                    <TabsContent value='jobOpenings' className='w-full text-light-1'>
                        <div className="flex items-center gap-2">
                            <h2 className='text-left text-heading3-bold text-black mt-2 ml-2'>
                                Job Openings
                            </h2>

                            <CreateJobOpeningBtn orgId={communityId} />
                        </div>

                        <section className='mt-9 flex flex-col gap-10 text-black'>
                            {jobOpenings.map((jobOpening: any) => {
                                
                                console.log("jbid = ", JSON.stringify(jobOpening._id));
                                
                                return (
                                <div>

                                    <JobOpeningCard
                                        oid={jobOpening._id}
                                        orgId={communityId}
                                        orgName={communityDetails.name}
                                        orgImage={communityDetails.image}
                                        createdAt={jobOpening.createdAt}
                                        creatorId={jobOpening.createdBy.id}
                                        creatorName={jobOpening.createdBy.name}
                                        creatorImage={jobOpening.createdBy.image}
                                        title={jobOpening.title}
                                        description={jobOpening.description || ""}
                                        demandedSkills={jobOpening.demandedSkills || []}
                                        attachment={jobOpening.attachment || ""}
                                        urls={jobOpening.urls || []}
                                        showBtn={true}
                                    />
                                </div>
                            )})
                            }

                        </section>
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    );
}

export default Page;