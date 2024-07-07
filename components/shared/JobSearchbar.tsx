"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "../ui/input";


interface Props {
    routeType: string;
}

function JobSearchbar({ routeType }: Props) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [skillArray, setSkillArray] = useState<string[]>([])
    const [inputSkill, setInputSkill] = useState<string>("")

    const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const currSkill = inputSkill.trim().toLowerCase()
        if (e.key === 'Enter' && currSkill !== '') {
            e.preventDefault();
            if (!skillArray.includes(currSkill)) {
              
                setSkillArray([...skillArray, currSkill]);
              
                setInputSkill('');
            }

        }
    };


    const removeSkill = (s: string) => {
       
        setSkillArray(skillArray.filter((skill) => skill !== s));
    };

    // query after 0.3s of no input
    useEffect(() => {
        // uriencode all elements of skillarray

        const delayDebounceFn = setTimeout(() => {
            if (search) {
                router.push(`/${routeType}?q=` + encodeURI(search) + `&skills=` + encodeURIComponent(skillArray.join(',')));
            } else {
                router.push(`/${routeType}?skills=` + encodeURIComponent(skillArray.join(',')));
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search, routeType, skillArray]);

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
                    placeholder="Search job Openings"
                    className='no-focus searchbar_input'
                />
            </div>
           
                
                    <input
                        type="text"
                        value={inputSkill}
                        onChange={(e) => setInputSkill(e.target.value)}
                        onKeyDown={addSkill}
                        placeholder="Enter Skills"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md my-2"
                    />
                    <div className="flex flex-wrap">
                        {skillArray.map((curr, index) => (
                            <div key={index} className="flex items-center bg-gray-200 text-gray-800 text-sm font-medium mr-2 mb-2 px-2 py-1 rounded overflow-y-scroll">
                                {curr}
                                <span onClick={() => removeSkill(curr)} className="ml-2 cursor-pointer text-red-500">x</span>
                            </div>
                        ))}
                    </div>
                
            
         
        </>
    );
}

export default JobSearchbar;