"use client"
import { useEffect, useRef, useState } from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../ui/button';
import { updateUserSkillSet } from '@/lib/actions/user.actions';
import { Accordion, AccordionContent, AccordionTrigger } from '../ui/accordion';
import { AccordionItem } from '@radix-ui/react-accordion';

export interface skill {
    skillName: string;
    credentials: string[];
}

const SkillNameValidation = z.object({
    name: z
        .string()
        .min(1, { message: "Minimum 1 characters." })
        .max(40, { message: "Maximum 40 caracters." }),

});


const SkillForm = ({ userId, skillSet }: { userId: string, skillSet: skill[] }) => {
    const form = useForm<z.infer<typeof SkillNameValidation>>({
        resolver: zodResolver(SkillNameValidation),
        defaultValues: {
            name: '',
        },
    });
    const [skills, setSkills] = useState(skillSet);
    const [inputCredentialName, setInputCredentialName] = useState<string>("");
    const [disabledButtons, setDisabledButtons] = useState<boolean>(false)
    


    const [credentialArray, setCredentialArray] = useState<string[]>([])
    useEffect(() => {
      console.log("skills = ", skills);
      form.reset()
        setCredentialArray([]);
        setDisabledButtons(false)
    }, [skills])
    

    const checkPresence = (s: string) => {
        // iterate each element of skillset
        for (let i = 0; i < skills.length; i++) {
            // check if skill is already in skillset
            if (skills[i].skillName === s) {
                return true;
            }
        }
        return false;
    }


    const addCredential = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const currCredential = inputCredentialName.trim().toLowerCase()

        if (e.key === 'Enter' && currCredential !== '') {
            e.preventDefault();
            if (!credentialArray.includes(currCredential)) {
                // setSkills([...skills, input]);
                setCredentialArray([...credentialArray, currCredential]);
                // setInput({ skillName: '', credentials: [] });
                setInputCredentialName('');
            }

        }
    };

    const removeCredential = (s: string) => {
        // setSkills(skills.filter((skill) => skill.skillName !== s));
        setCredentialArray(credentialArray.filter((skill) => skill !== s));
    };

    const addToSkillState = ({ skillName, credentials }: { skillName: string, credentials: string[] }) => {
        setDisabledButtons(true);

        setSkills([...skills, { skillName, credentials }]);
        setDisabledButtons(true);

        
        // add delay
        
        
    };

    const removeFromSkillState = (skillName: string) => {
        setDisabledButtons(true);


        setSkills(skills.filter((skill) => skill.skillName !== skillName));
    };


    const onSubmit = async (values: z.infer<typeof SkillNameValidation>) => {
        console.log("skills = ", skills);
        setDisabledButtons(true);
        // await updateUserSkillSet({

        // });
        // console.log("skillname = ", values.name);
        // console.log("credentialArray = ", credentialArray);
        form.reset();
    };

    return (
        <>

            {skills.length > 0 && (
                <Accordion type="single" collapsible className="w-full bg-white rounded-lg p-2 ">

                    {skills.map((skill) => (
                        <AccordionItem value={'item-1'} key={skill.skillName}>
                            <AccordionTrigger className="text-black">{skill.skillName}</AccordionTrigger>

                            <AccordionContent className='pt-3 overflow-scroll'>
                                {
                                    skill.credentials.map((credential: string) => (
                                        <a
                                            href={credential}
                                            key={credential}
                                            target="_blank"
                                            className="px-2 mx-1 py-1 rounded  text-primary-500 hover:bg-light-2 border border-black"
                                        >
                                            {credential}
                                        </a>
                                    ))
                                }

                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}






            <div className="mb-4 mt-4">



                <Form {...form}>
                    <form
                        className='flex flex-col justify-start gap-10'
                        onSubmit={form.handleSubmit(onSubmit)}
                    >

                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem className='flex w-full flex-col gap-3'>
                                    <FormLabel className='text-base-semibold text-black'>
                                        SkillName
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type='text'
                                            className='account-form_input no-focus'
                                            
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <input
                            type="text"
                            value={inputCredentialName}
                            onChange={(e) => setInputCredentialName(e.target.value)}
                            onKeyDown={addCredential}
                            placeholder="Add Credentials"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <div className="flex flex-wrap">
                            {credentialArray.map((curr, index) => (
                                <div key={index} className="flex items-center bg-gray-200 text-gray-800 text-sm font-medium mr-2 mb-2 px-2 py-1 rounded">
                                    {curr}
                                    <span onClick={() => removeCredential(curr)} className="ml-2 cursor-pointer text-red-500">x</span>
                                </div>
                            ))}
                        </div>
                        <Button className='bg-primary-500' onClick={() => addToSkillState({ skillName: (form.getValues('name')), credentials: credentialArray })}>
                            Add
                        </Button>

                        <Button type='submit' className='bg-primary-500'>
                            save
                        </Button>
                    </form>
                </Form>


                {/* <p className={`text-red-500 ${validTag ? 'hidden' : 'block'}`}>please enter a valid tag</p> */}
            </div>
        </>
    );
};

export default SkillForm;