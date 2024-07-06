"use client";

import * as z from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import {
    ChangeEvent,
    useEffect,
    useState
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";

import { useUploadThing } from "@/lib/validations/uploadthing";
import { isBase64Image } from "@/lib/utils";

import { UserValidation } from "@/lib/validations/user";
import { updateUser } from "@/lib/actions/user.actions";
import { Accordion, AccordionContent, AccordionTrigger, AccordionItem } from '../ui/accordion';
import Loader from "../shared/Loader";
import { DeleteConfirmation } from "../shared/DeleteConfirmation";
import { Label } from "@radix-ui/react-label";
import Link from "next/link";





export interface skill {
    skillName: string;
    credentials: string[];
}

export interface qualification {
    name: string;
    credentialUrl: string;
    issuingAuthority: string;

}

interface Props {
    user: {
        id: string;
        objectId: string;
        username: string;
        name: string;
        bio: string;
        image: string;
        // skillSet: skill[];
    };
    btnTitle: string;
    userSkillSet?: skill[];
    qualifications: qualification[]
}


const AccountProfile = ({ user, btnTitle, userSkillSet, qualifications }: Props) => {


    const userId: string = user.id;
    const skillSet: skill[] = userSkillSet ? userSkillSet : [];
    const router = useRouter();
    const pathname = usePathname();
    const { startUpload } = useUploadThing("media");
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setisLoading] = useState<boolean>(false)



    // skill related
    const [skills, setSkills] = useState<skill[]>(skillSet);
    const [inputCredentialName, setInputCredentialName] = useState<string>("");
    const [disabledButtons, setDisabledButtons] = useState<boolean>(false)
    const [credentialArray, setCredentialArray] = useState<string[]>([])



    // qualification related
    const [qualificationsArray, setQualificationsArray] = useState<qualification[]>(qualifications)
    const [qualificationNameInput, setQualificationNameInput] = useState<string>("")
    const [qualificationAuthorityInput, setQualificationAuthorityInput] = useState<string>("")
    const [qualificationUrlInput, setQualificationUrlInput] = useState<string>("")
    const [disabledButtonsQualification, setDisabledButtonsQualification]
        = useState<boolean>(qualificationUrlInput === "" || qualificationNameInput === "" || qualificationAuthorityInput === "" ? true : false)






    const form = useForm<z.infer<typeof UserValidation>>({
        resolver: zodResolver(UserValidation),
        defaultValues: {
            profile_photo: user?.image ? user.image : "",
            name: user?.name ? user.name : "",
            username: user?.username ? user.username : "",
            bio: user?.bio ? user.bio : "",
            skillName: "",
        },
    });




    useEffect(() => {
        setDisabledButtons(true);
        // console.log("skills = ", skills);
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
        form.setValue("skillName", "");
        // add delay
    };



    const removeFromSkillState = (skillName: string) => {
        setSkills(skills.filter((skill) => skill.skillName !== skillName));
    };

    const addQualification = () => {
        // if (disabledButtonsQualification) return;
        setQualificationsArray([...qualificationsArray, {
            name: qualificationNameInput,
            credentialUrl: qualificationUrlInput,
            issuingAuthority: qualificationAuthorityInput
        }])

        setQualificationNameInput("")
        setQualificationAuthorityInput("")
        setQualificationUrlInput("")
    }


    const removeQualification = (name: string) => {
        setQualificationsArray(qualificationsArray.filter((q) => q.name !== name));
    }



    const onSubmit = async (values: z.infer<typeof UserValidation>) => {
        // console.log("skills given = ", skills);
        setisLoading(true);
        setDisabledButtons(true);

        const blob = values.profile_photo;

        const hasImageChanged = isBase64Image(blob);
        if (hasImageChanged) {
            const imgRes = await startUpload(files);

            if (imgRes && imgRes.length > 0 && imgRes[0].url) {
                values.profile_photo = imgRes[0].url;
            }
        }

        await updateUser({
            name: values.name,
            path: pathname,
            username: values.username,
            userId: user.id,
            bio: values.bio,
            image: values.profile_photo,
            skillSet: skills,
            qualifications: qualificationsArray
        });

        form.reset();
        setInputCredentialName('');
        setDisabledButtons(false);

        if (pathname === "/profile/edit") {
            router.back();
        } else {
            router.push("/");
        }

        setisLoading(false);
    };

    const handleImage = (
        e: ChangeEvent<HTMLInputElement>,
        fieldChange: (value: string) => void
    ) => {
        e.preventDefault();

        const fileReader = new FileReader();

        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFiles(Array.from(e.target.files));

            if (!file.type.includes("image")) return;

            fileReader.onload = async (event) => {
                const imageDataUrl = event.target?.result?.toString() || "";
                fieldChange(imageDataUrl);
            };

            fileReader.readAsDataURL(file);
        }
    };

    return (
        <>
            <Form {...form}>
                <form
                    className='flex flex-col justify-start gap-10'
                    onSubmit={form.handleSubmit(onSubmit)}
                >


                    <FormField
                        control={form.control}
                        name='profile_photo'
                        render={({ field }) => (
                            <FormItem className='flex items-center gap-4'>
                                <FormLabel className='account-form_image-label'>
                                    {field.value ? (
                                        <Image
                                            src={field.value}
                                            alt='profile_icon'
                                            width={96}
                                            height={96}
                                            priority
                                            className='rounded-full object-contain'
                                        />
                                    ) : (
                                        <Image
                                            src='/assets/profile.svg'
                                            alt='profile_icon'
                                            width={24}
                                            height={24}
                                            className='object-contain'
                                        />
                                    )}
                                </FormLabel>
                                <FormControl className='flex-1 text-base-semibold text-gray-200'>
                                    <Input
                                        type='file'
                                        accept='image/*'
                                        placeholder='Add profile photo'
                                        className='account-form_image-input text-black border border-gray-400'
                                        onChange={(e) => handleImage(e, field.onChange)}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />





                    <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                            <FormItem className='flex w-full flex-col gap-3'>
                                <FormLabel className='text-base-semibold text-black '>
                                    Name
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type='text'
                                        className='account-form_input no-focus border border-gray-400'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />



                    <FormField
                        control={form.control}
                        name='username'
                        render={({ field }) => (
                            <FormItem className='flex w-full flex-col gap-3'>
                                <FormLabel className='text-base-semibold text-black '>
                                    Username
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type='text'
                                        className='account-form_input no-focus border border-gray-400'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />



                    <FormField
                        control={form.control}
                        name='bio'
                        render={({ field }) => (
                            <FormItem className='flex w-full flex-col gap-3'>
                                <FormLabel className='text-base-semibold text-black'>
                                    Bio
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        rows={10}
                                        className='account-form_input no-focus border border-gray-400'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    {/* skill specification */}

                    {pathname === "/profile/edit" && (
                        <>
                            <Accordion type="single" collapsible className="w-full  rounded-lg p-2 ">

                                <AccordionItem value={"skill label"} className='my-2 border-1 border-black rounded-lg p-2 w-full'>
                                    <div className='w-full flex items-center gap-4'>
                                        <FormLabel>Skills</FormLabel>
                                        <Label htmlFor="add-akill-trigger" className="text-white bg-black font-bold rounded-lg p-2 hover:cursor-pointer">Add</Label>
                                        <AccordionTrigger id="add-akill-trigger" className="text-black inline opacity-0">

                                        </AccordionTrigger>
                                    </div>

                                    <AccordionContent className='p-4 overflow-y-scroll bg-white flex flex-col gap-6 h-min[300px]'>
                                        <FormField
                                            control={form.control}
                                            name='skillName'
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
                                        <div className={`bg-primary-500 text-white text-center hover:bg-black p-2 font-bold rounded-lg ${disabledButtons ? "cursor-not-allowed" : "cursor-pointer"} `} onClick={() => { disabledButtons ? null : addToSkillState({ skillName: (form.getValues('skillName')), credentials: credentialArray }) }}>
                                            Add Skill
                                        </div>

                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>


                            {(skills && skills.length) > 0 && (

                                <Accordion type="single" collapsible className="w-full  rounded-lg p-2 ">
                                    {skills.map((skill) => (
                                        <AccordionItem value={skill.skillName} key={skill.skillName} className='mb-2 border-1 border-black bg-white rounded-lg p-2 w-full'>
                                            <div className='w-full flex justify-between '>
                                                <AccordionTrigger className="text-black">{skill.skillName}</AccordionTrigger>
                                                {/* <button className='bg-red-500 text-white p-2 rounded-lg' onClick={() => removeFromSkillState(skill.skillName)} >Delete</button> */}
                                                <button className=' text-white p-2 rounded-lg' onClick={() => removeFromSkillState(skill.skillName)} >
                                                    <Image
                                                        src='/assets/delete.svg' alt='delete' width={20} height={20} />
                                                </button>

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





                        </>
                    )}


                    {/* qualification specification */}

                    {pathname === "/profile/edit" && (
                        <>
                            <Accordion type="single" collapsible className="w-full  rounded-lg p-2 ">

                                <AccordionItem value={"skill label"} className='my-2 border-1 border-black rounded-lg p-2 w-full'>
                                    <div className='w-full flex items-center gap-4'>
                                        <FormLabel>Qualifications</FormLabel>
                                        <Label htmlFor="add-qualification-trigger" className="text-white bg-black font-bold rounded-lg p-2 hover:cursor-pointer">Add</Label>
                                        <AccordionTrigger id="add-qualification-trigger" className="text-black inline opacity-0">

                                        </AccordionTrigger>
                                    </div>

                                    <AccordionContent className='p-4 overflow-y-scroll bg-white flex flex-col gap-6 h-min[300px]'>

                                        <FormLabel className='text-base-semibold text-black'>
                                            Qualification Name
                                        </FormLabel>
                                        <Input
                                            type='text'
                                            className='account-form_input no-focus'
                                            value={qualificationNameInput}
                                            onChange={(e) => {
                                                setQualificationNameInput(e.target.value)
                                                setDisabledButtonsQualification(qualificationUrlInput === "" || qualificationNameInput === "" || qualificationAuthorityInput === "")
                                            }
                                            }
                                        />



                                        <FormLabel className='text-base-semibold text-black'>
                                            Authority
                                        </FormLabel>
                                        <Input
                                            type='text'
                                            className='account-form_input no-focus'
                                            value={qualificationAuthorityInput}
                                            onChange={(e) => {
                                                setQualificationAuthorityInput(e.target.value)
                                                setDisabledButtonsQualification(qualificationUrlInput === "" || qualificationNameInput === "" || qualificationAuthorityInput === "")
                                            }}
                                        />


                                        <FormLabel className='text-base-semibold text-black'>
                                            Credential URL
                                        </FormLabel>
                                        <Input
                                            type='text'
                                            className='account-form_input no-focus'
                                            value={qualificationUrlInput}
                                            onChange={(e) => {
                                                setQualificationUrlInput(e.target.value)
                                                setDisabledButtonsQualification(qualificationUrlInput === "" || qualificationNameInput === "" || qualificationAuthorityInput === "")
                                            }}
                                        />




                                        <div
                                            className={` text-white text-center  p-2 font-bold rounded-lg cursor-pointer bg-primary-500 hover:bg-black `}
                                            onClick={() => addQualification()}>
                                            Add Qualification
                                        </div>

                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>


                            {(qualificationsArray && qualificationsArray.length) > 0 && (
                                qualificationsArray.map((qualification) => (

                                    <div className='w-full flex bg-white p-2 rounded-lg my-2'>

                                        <div className="flex flex-col grow">

                                            <h2 className=' text-black text-heading3-bold'>
                                                {qualification.name}
                                            </h2>
                                            <p className='text-base-medium text-gray-1'>
                                                {qualification.issuingAuthority}
                                            </p>
                                            <a href={qualification.credentialUrl} target="_blank" className="h-10 font-bold text-blue rounded-lg inline">
                                                {qualification.credentialUrl}
                                            </a>
                                        </div>
                                        <button className=' text-white p-2 rounded-lg' onClick={() => removeQualification(qualification.name)} >
                                            <Image
                                                src='/assets/delete.svg' alt='delete' width={20} height={20} />
                                        </button>


                                    </div>
                                ))

                            )
                            }





                        </>
                    )}







                    <Button type='submit' className='bg-primary-500 font-bold'>
                        {btnTitle}
                    </Button>
                    {/* <div className="bg-red-500 text-center font-bold text-white hover:bg-black p-2 rounded-lg hover:cursor-pointer">Delete Account</div> */}
                </form>
            </Form>
            {
                isLoading && <Loader />
            }
            {pathname === "/profile/edit" && (
                <DeleteConfirmation userId={userId} />
            )}
            {isLoading && <Loader />}
        </>
    );
};

export default AccountProfile;