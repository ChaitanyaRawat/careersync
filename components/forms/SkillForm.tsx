"use client"
import { useEffect, useRef, useState } from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../ui/button';
import { updateUserSkillSet } from '@/lib/actions/user.actions';
import { Accordion, AccordionContent, AccordionTrigger, AccordionItem } from '../ui/accordion';


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

    // console.log("efjcmernjejenwjenhebwcewew37197189e1120812129")
    const form = useForm<z.infer<typeof SkillNameValidation>>({
        resolver: zodResolver(SkillNameValidation),
        defaultValues: {
            name: '',
        },
    });
    const [skills, setSkills] = useState<skill[]>(skillSet);
    const [inputCredentialName, setInputCredentialName] = useState<string>("");
    const [disabledButtons, setDisabledButtons] = useState<boolean>(false)



    const [credentialArray, setCredentialArray] = useState<string[]>([])
    useEffect(() => {
        setDisabledButtons(true);
        console.log("skills = ", skills);
        // form.reset()
        setCredentialArray([]);
        setDisabledButtons(false)
    }, [skills])





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
        setSkills([...skills, { skillName, credentials }]);
        // add delay
    };

    const removeFromSkillState = (skillName: string) => {
        setSkills(skills.filter((skill) => skill.skillName !== skillName));
    };


    const onSubmit = async (values: z.infer<typeof SkillNameValidation>) => {
        console.log("skills given = ", skills);
        setDisabledButtons(true);
        // await updateUserSkillSet({ userId: userId, skillSet: skills });
        // await updateUserSkillSet({

        // });
        // console.log("skillname = ", values.name);
        // console.log("credentialArray = ", credentialArray);
        form.reset();
        setInputCredentialName('');
        setDisabledButtons(false);
    };

    return (


        <>

            {skills.length > 0 && (

                <Accordion type="single" collapsible className="w-full  rounded-lg p-2 ">
                    {skills.map((skill) => (
                        <AccordionItem value={'list of skills'} key={skill.skillName} className='my-2 border-1 border-black bg-white rounded-lg p-2 w-full'>
                            <div className='w-full flex justify-between '>
                                <AccordionTrigger className="text-black">{skill.skillName}</AccordionTrigger>
                                <button className='bg-red-500 text-white p-2 rounded-lg' onClick={() => removeFromSkillState(skill.skillName)} >Delete</button>
                            </div>

                            <AccordionContent className='pt-3 overflow-y-scroll flex flex-col gap-2'>
                                {
                                    skill.credentials.map((credential: string) => (
                                        <a
                                            href={credential}
                                            key={credential}
                                            target="_blank"
                                            className="px-2 mx-1 py-1 rounded  text-primary-500 hover:bg-light-2 border border-black overflow-y-scroll"
                                        >
                                            {credential}
                                        </a>
                                    ))
                                }

                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )
            }






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
                                <div key={index} className="flex items-center bg-gray-200 text-gray-800 text-sm font-medium mr-2 mb-2 px-2 py-1 rounded overflow-y-scroll">
                                    {curr}
                                    <span onClick={() => removeCredential(curr)} className="ml-2 cursor-pointer text-red-500">x</span>
                                </div>
                            ))}
                        </div>
                        <Button disabled={disabledButtons} className='bg-primary-500' onClick={() => addToSkillState({ skillName: (form.getValues('name')), credentials: credentialArray })}>
                            Add
                        </Button>

                        <Button disabled={disabledButtons} type='submit' className='bg-primary-500'>
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




