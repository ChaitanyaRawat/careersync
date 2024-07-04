"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Props {
    routeType: string;
}

function Searchbar({ routeType }: Props) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [skillArray, setSkillArray] = useState<string[]>([])
    const [inputSkillName, setInputSkillName] = useState<string>("")

    const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const currSkill = inputSkillName.trim().toLowerCase()
        if (e.key === 'Enter' && currSkill !== '') {
            e.preventDefault();
            if (!skillArray.includes(currSkill)) {
                // setSkills([...skills, input]);
                setSkillArray([...skillArray, currSkill]);
                // setInput({ skillName: '', credentials: [] });
                setInputSkillName('');
            }

        }
    };


    const removeSkill = (s: string) => {
        // setSkills(skills.filter((skill) => skill.skillName !== s));
        setSkillArray(skillArray.filter((skill) => skill !== s));
    };

    // query after 0.3s of no input
    useEffect(() => {
        // uriencode all elements of skillarray

        const delayDebounceFn = setTimeout(() => {
            if (search) {
                router.push(`/${routeType}?q=` + search + `&s=` + encodeURIComponent(skillArray.join(',')));
            } else {
                router.push(`/${routeType}?s=` + encodeURIComponent(skillArray.join(',')));
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
                    placeholder={`${routeType !== "search" ? "Search communities" : "Search People"
                        }`}
                    className='no-focus searchbar_input'
                />
            </div>
            {routeType !== "communities" && (
                <>
                    <input
                        type="text"
                        value={inputSkillName}
                        onChange={(e) => setInputSkillName(e.target.value)}
                        onKeyDown={addSkill}
                        placeholder="Enter Skills you seek"
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
            )
            }
        </>
    );
}

export default Searchbar;