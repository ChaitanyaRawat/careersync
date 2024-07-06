import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import ThreadCard from "@/components/cards/ThreadCard";
import Pagination from "@/components/shared/Pagination";

import { fetchPosts } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import PostSearchbar from "@/components/shared/PostSearchbar";

async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const tags: string[] | undefined = searchParams?.tags?.split(",").map(decodeURIComponent)
  const q: string | undefined = decodeURIComponent(searchParams?.q || "")

  // console.log("q = ", q)
  // console.log("tags = ", tags)
  const result = await fetchPosts(
    searchParams.page ? +searchParams.page : 1,
    30,
    q,
    (tags?.length === 1 && tags[0] === "" ? [] : tags)
  );




  return (
    <>
      <h1 className='head-text text-left'>Home</h1>
      <p className="mb-4">Explore all the latest posts</p>
      <PostSearchbar routeType="" />

      <section className='mt-9 flex flex-col gap-10'>
        {result.posts.length === 0 ? (
          <p className='no-result'>No threads found</p>
        ) : (
          <>
            {result.posts.map((post) => (
              <ThreadCard
                key={post._id}
                id={post._id}
                currentUserId={user.id}
                parentId={post.parentId}
                content={post.text}
                author={post.author}
                community={post.community}
                createdAt={post.createdAt}
                comments={post.children}
                tags={post.tags}
                urls={post.urls}
                attachment={post.attachment}
                likedBy={post.likedBy}
              />
            ))}
          </>
        )}
      </section>

      <Pagination
        path='/'
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </>
  );
}

export default Home;
