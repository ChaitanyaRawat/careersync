import { redirect } from "next/navigation";

import { fetchCompanyPosts } from "@/lib/actions/company.actions";
import { fetchUserPosts } from "@/lib/actions/user.actions";

import CareerpostCard from "../cards/CareerpostCard";

interface Result {
    name: string;
    image: string;
    id: string;
    careerposts: {
        _id: string;
        text: string;
        parentId: string | null;
        author: {
            name: string;
            image: string;
            id: string;
        };
        company: {
            id: string;
            name: string;
            image: string;
        } | null;
        createdAt: string;
        children: {
            author: {
                image: string;
            };
        }[];
        tags: string[];
        urls: string[];
        attachment: string | null | undefined;
        likedBy:{
            id: string;
            name: string;
            image: string;
        }[]
    }[];
}

interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string;
}

async function CareerpostsTab({ currentUserId, accountId, accountType }: Props) {
    let result: Result;

    if (accountType === "Company") {
        result = await fetchCompanyPosts(accountId);
    } else {
        result = await fetchUserPosts(accountId);
    }

   

    if (!result) {
        redirect("/");
    }

    return (
        <section className='mt-9 flex flex-col gap-10 overflow-scroll'>
            {result.careerposts.map((careerpost) => (
                <CareerpostCard
                    key={careerpost._id}
                    id={careerpost._id}
                    currentUserId={currentUserId}
                    parentId={careerpost.parentId}
                    content={careerpost.text}
                    author={
                        accountType === "User"
                            ? { name: result.name, image: result.image, id: result.id }
                            : {
                                name: careerpost.author.name,
                                image: careerpost.author.image,
                                id: careerpost.author.id,
                            }
                    }
                    company={
                        accountType === "Company"
                            ? { name: result.name, id: result.id, image: result.image }
                            : careerpost.company
                    }
                    createdAt={careerpost.createdAt}
                    comments={careerpost.children}
                    tags={careerpost.tags}
                    urls={careerpost.urls}
                    attachment={careerpost.attachment}
                    likedBy={careerpost.likedBy}
                />
            ))}
        </section>
    );
}

export default CareerpostsTab;