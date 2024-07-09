import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import Comment from "@/components/forms/Comment";
import CareerpostCard from "@/components/cards/CareerpostCard";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchCareerpostById } from "@/lib/actions/careerpost.actions";

export const revalidate = 0;

async function page({ params }: { params: { id: string } }) {
    if (!params.id) return null;

    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    const careerpost = await fetchCareerpostById(params.id);

    return (
        <section className='relative'>
            <div>
                <CareerpostCard
                    id={careerpost._id}
                    currentUserId={user.id}
                    parentId={careerpost.parentId}
                    content={careerpost.text}
                    author={careerpost.author}
                    company={careerpost.company}
                    createdAt={careerpost.createdAt}
                    comments={careerpost.children}
                    tags={careerpost.tags}
                    urls={careerpost.urls}
                    attachment={careerpost.attachment}
                    likedBy={careerpost.likedBy}
                />
            </div>

            <div className='mt-7'>
                <Comment
                    careerpostId={params.id}
                    currentUserImg={userInfo.image}
                    currentUserId={JSON.stringify(userInfo._id)}
                />
            </div>

            <div className='mt-10'>
                {careerpost.children.map((childItem: any) => (
                    <CareerpostCard
                        key={childItem._id}
                        id={childItem._id}
                        currentUserId={user.id}
                        parentId={childItem.parentId}
                        content={childItem.text}
                        author={childItem.author}
                        company={childItem.company}
                        createdAt={childItem.createdAt}
                        comments={childItem.children}
                        tags={childItem.tags}
                        urls={childItem.urls}
                        attachment={childItem.attachment}
                        isComment
                        likedBy={childItem.likedBy}
                    />
                ))}
            </div>
        </section>
    );
}

export default page;