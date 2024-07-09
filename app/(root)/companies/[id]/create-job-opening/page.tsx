import CreateJobOpening from '@/components/forms/CreateJobOpening';
import { fetchUser } from '@/lib/actions/user.actions';
import { useOrganization } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'

const page = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");
  
  const str = JSON.stringify(userInfo._id);
  

  return (
    <>
      <h1 className='head-text'>Create a Job Opening</h1>
      <CreateJobOpening orgId={params.id} creatorId={str} />
    </>
  )
}

export default page