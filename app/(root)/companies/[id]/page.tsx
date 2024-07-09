import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";

import { companyTabs } from "@/constants";

import UserCard from "@/components/cards/UserCard";
import CareerpostsTab from "@/components/shared/CareerpostsTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { fetchCompanyDetails, fetchJobOpeningsOfCompany } from "@/lib/actions/company.actions";

import { Link } from "lucide-react";
import CreateJobOpeningBtn from "@/components/shared/CreateJobOpeningBtn";
import JobOpeningCard from "@/components/cards/JobOpeningCard";

async function Page({ params }: { params: { id: string } }) {
    const companyId = params.id

    const user = await currentUser();
    if (!user) return null;



    const companyDetails = await fetchCompanyDetails(params.id);
 
    const jobOpenings = await fetchJobOpeningsOfCompany(companyId);
   

    return (
        <section>
            <ProfileHeader
                accountId={companyDetails.createdBy.id}
                authUserId={user.id}
                name={companyDetails.name}
                username={companyDetails.username}
                imgUrl={companyDetails.image}
                bio={companyDetails.bio}
                orgId={companyDetails.id}
                websiteUrl={companyDetails.websiteUrl}
                type='Company'
            />

            <div className='mt-9'>
                <Tabs defaultValue='posts' className='w-full'>
                    <TabsList className='tab'>
                        {companyTabs.map((tab) => (
                            <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                                <Image
                                    src={tab.icon}
                                    alt={tab.label}
                                    width={24}
                                    height={24}
                                    className='object-contain'
                                />
                                <p className='max-sm:hidden'>{tab.label}</p>

                                {/* {tab.label === "Careerposts" && (
                                    <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'>
                                        {companyDetails.careerposts.length}
                                    </p>
                                )} */}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value='posts' className='w-full text-light-1'>
                        {/* @ts-ignore */}
                        <CareerpostsTab
                            currentUserId={user.id}
                            accountId={companyDetails._id}
                            accountType='Company'
                        />
                    </TabsContent>

                    <TabsContent value='members' className='mt-9 w-full text-light-1'>
                        <section className='mt-9 flex flex-col gap-10'>
                            {companyDetails.members.map((member: any) => (
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

                            <CreateJobOpeningBtn orgId={companyId} />
                        </div>

                        <section className='mt-9 flex flex-col gap-10 text-black'>
                            {jobOpenings.map((jobOpening: any) => {
                                
                              
                                
                                return (
                                <div>

                                    <JobOpeningCard
                                        oid={jobOpening._id}
                                        orgId={companyId}
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