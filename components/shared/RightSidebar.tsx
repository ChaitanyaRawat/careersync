import { currentUser } from "@clerk/nextjs/server";

import UserCard from "../cards/UserCard";

import { fetchCompanies } from "@/lib/actions/company.actions";
import { fetchUsers } from "@/lib/actions/user.actions";

async function RightSidebar() {
    const user = await currentUser();
    if (!user) return null;

    const similarMinds = await fetchUsers({
        userId: user.id,
        pageSize: 4,
    });

    const suggestedCOmmunities = await fetchCompanies({ pageSize: 4 });

    return (
        <section className='custom-scrollbar rightsidebar'>
            <div className='flex flex-1 flex-col justify-start'>
                <h3 className='text-heading4-medium text-light-1'>
                    Suggested Companies
                </h3>

                <div className='mt-7 flex w-[350px] flex-col gap-9'>
                    {suggestedCOmmunities.companies.length > 0 ? (
                        <>
                            {suggestedCOmmunities.companies.map((company) => (
                                <UserCard
                                    key={company.id}
                                    id={company.id}
                                    name={company.name}
                                    username={company.username}
                                    imgUrl={company.image}
                                    personType='Company'
                                />
                            ))}
                        </>
                    ) : (
                        <p className='!text-base-regular text-light-3'>
                            No companies yet
                        </p>
                    )}
                </div>
            </div>

            <div className='flex flex-1 flex-col justify-start'>
                <h3 className='text-heading4-medium text-light-1'>Similar Minds</h3>
                <div className='mt-7 flex w-[350px] flex-col gap-10'>
                    {similarMinds.users.length > 0 ? (
                        <>
                            {similarMinds.users.map((person) => (
                                <UserCard
                                    key={person.id}
                                    id={person.id}
                                    name={person.name}
                                    username={person.username}
                                    imgUrl={person.image}
                                    personType='User'
                                />
                            ))}
                        </>
                    ) : (
                        <p className='!text-base-regular text-light-3'>No users yet</p>
                    )}
                </div>
            </div>
        </section>
    );
}

export default RightSidebar;