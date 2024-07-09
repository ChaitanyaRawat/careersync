import { fetchCareerpostById } from '@/lib/actions/careerpost.actions';
import { fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CareerpostCard from '@/components/cards/CareerpostCard';
import Image from 'next/image';
import Link from 'next/link';

const page = async ({ params }: { params: { id: string } }) => {
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
            <section className='mt-10 flex flex-col gap-5'>
                {
                    careerpost.likedBy && careerpost.likedBy.length > 0 ? (
                        careerpost.likedBy.map((userLiked: any) => (
                            <Link href={`/profile/${userLiked.id}`}>
                                <article className='activity-card'>
                                    <Image
                                        src={userLiked.image}
                                        alt='user_logo'
                                        width={20}
                                        height={20}
                                        className='rounded-full object-cover'
                                    />
                                    <p className='!text-small-regular black'>
                                        <span className='mr-1 text-primary-500 font-bold'>
                                            {userLiked.name}
                                        </span>{" "}
                                        liked this post
                                    </p>
                                </article>
                            </Link>
                        ))
                    ) : (
                        <p className='no-result'>No likes found</p>
                    )

                }


            </section>

        </section>
    )
}

export default page