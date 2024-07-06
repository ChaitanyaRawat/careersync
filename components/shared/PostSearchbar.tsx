"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "../ui/input";


interface Props {
    routeType: string;
}

function PostSearchbar({ routeType }: Props) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [tagArray, setTagArray] = useState<string[]>([])
    const [inputTag, setInputTag] = useState<string>("")

    const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const currTag = inputTag.trim().toLowerCase()
        if (e.key === 'Enter' && currTag !== '') {
            e.preventDefault();
            if (!tagArray.includes(currTag)) {
              
                setTagArray([...tagArray, currTag]);
              
                setInputTag('');
            }

        }
    };


    const removeTag = (s: string) => {
       
        setTagArray(tagArray.filter((tag) => tag !== s));
    };

    // query after 0.3s of no input
    useEffect(() => {
        // uriencode all elements of skillarray

        const delayDebounceFn = setTimeout(() => {
            if (search) {
                router.push(`/${routeType}?q=` + encodeURI(search) + `&tags=` + encodeURIComponent(tagArray.join(',')));
            } else {
                router.push(`/${routeType}?tags=` + encodeURIComponent(tagArray.join(',')));
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search, routeType, tagArray]);

    return (
        <>
            <div className='searchbar'>
                <Image
                    src='/assets/search-gray.svg'
                    alt='search'
                    width={24}
                    height={24}
                    className='object-contain'
                />
                <Input
                    id='text'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Posts by content"
                    className='no-focus searchbar_input'
                />
            </div>
           
                
                    <input
                        type="text"
                        value={inputTag}
                        onChange={(e) => setInputTag(e.target.value)}
                        onKeyDown={addTag}
                        placeholder="Enter Tags"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md my-2"
                    />
                    <div className="flex flex-wrap">
                        {tagArray.map((curr, index) => (
                            <div key={index} className="flex items-center bg-gray-200 text-gray-800 text-sm font-medium mr-2 mb-2 px-2 py-1 rounded overflow-y-scroll">
                                {curr}
                                <span onClick={() => removeTag(curr)} className="ml-2 cursor-pointer text-red-500">x</span>
                            </div>
                        ))}
                    </div>
                
            
         
        </>
    );
}

export default PostSearchbar;