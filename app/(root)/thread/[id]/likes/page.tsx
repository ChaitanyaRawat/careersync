import { fetchThreadById } from '@/lib/actions/thread.actions';
import { fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ThreadCard from '@/components/cards/ThreadCard';
import Image from 'next/image';
import Link from 'next/link';

const page = async ({ params }: { params: { id: string } }) => {
    if (!params.id) return null;

    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    const thread = await fetchThreadById(params.id);
    return (
        <section className='relative'>
            <div>
                <ThreadCard
                    id={thread._id}
                    currentUserId={user.id}
                    parentId={thread.parentId}
                    content={thread.text}
                    author={thread.author}
                    community={thread.community}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                    tags={thread.tags}
                    urls={thread.urls}
                    attachment={thread.attachment}
                    likedBy={thread.likedBy}
                />
            </div>
            <section className='mt-10 flex flex-col gap-5'>
                {
                    thread.likedBy && thread.likedBy.length > 0 ? (
                        thread.likedBy.map((userLiked: any) => (
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