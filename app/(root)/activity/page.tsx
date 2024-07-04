import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchUser, getCommentActivity, getLikeActivity } from "@/lib/actions/user.actions";

async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const commentActivity = await getCommentActivity(userInfo._id);
  const likeActivity = await getLikeActivity(userInfo._id);
  // console.log("like activity = ", likeActivity);

  return (
    <>
      <h1 className='head-text'>Activity</h1>
      <Tabs defaultValue='likes' className='w-full'>

        <TabsList className='tab'>
          <TabsTrigger value={"likes"} className='tab' >
            <Image
              src={'/assets/not-liked.svg'}
              alt={"likes"}
              width={24}
              height={24}
              className='object-contain'
            />
            <p className='max-sm:hidden'>{"Likes"}</p>
            {/* <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'>
              {likeActivity.length}
            </p> */}
          </TabsTrigger>
          <TabsTrigger value={"comments"} className='tab' >
            <Image
              src={'/assets/reply.svg'}
              alt={"comments"}
              width={24}
              height={24}
              className='object-contain'
            />
            <p className='max-sm:hidden'>{"Comments"}</p>
            <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'>
              {commentActivity.length}
            </p>
          </TabsTrigger>
        </TabsList>





        <TabsContent value="likes" className='w-full text-black'>
          <section className='mt-10 flex flex-col gap-5'>
            {likeActivity.length > 0 ? (
              <>
                {likeActivity.map((post) => (
                  <>
                    {post.likedBy.length > 0 &&
                      post.likedBy.map((userLiked: any) => {
                        return (
                          <Link key={post._id} href={`/thread/${post._id}`}>
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
                                liked your post
                              </p>
                            </article>
                          </Link>
                        )
                      })
                    }
                  </>
                ))}
              </>
            ) : (
              <p className='!text-base-regular text-light-3'>No Likes yet</p>
            )}
          </section>
        </TabsContent>


        <TabsContent value="comments" className='w-full text-black'>
          <section className='mt-10 flex flex-col gap-5'>
            {commentActivity.length > 0 ? (
              <>
                {commentActivity.map((activity) => (
                  <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                    <article className='activity-card'>
                      <Image
                        src={activity.author.image}
                        alt='user_logo'
                        width={20}
                        height={20}
                        className='rounded-full object-cover'
                      />
                      <p className='!text-small-regular black'>
                        <span className='mr-1 text-primary-500 font-bold'>
                          {activity.author.name}
                        </span>{" "}
                        replied to your post
                      </p>
                    </article>
                  </Link>
                ))}
              </>
            ) : (
              <p className='!text-base-regular text-light-3'>No Comments yet</p>
            )}
          </section>
        </TabsContent>

      </Tabs>



    </>
  );
}

export default Page;