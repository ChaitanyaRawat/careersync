"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useOrganization } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { useState, ChangeEvent, useEffect } from "react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { ThreadValidation } from "@/lib/validations/thread";
import { createThread } from "@/lib/actions/thread.actions";

import PostUrl from "./PostUrl";
import { useUploadThing } from "@/lib/validations/uploadthing";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CreateJobOpeningValidation } from "@/lib/validations/jobOpening";
import MultiValueInput from "../shared/MultiValueInput";
import Image from "next/image";
import { createJobOpening } from "@/lib/actions/community.actions";

function CreateJobOpening({ orgId, creatorId }: { orgId: string, creatorId: string }) {

    const router = useRouter();
    const pathname = usePathname();
    const { startUpload } = useUploadThing("media");
    const [inputUrl, setInputUrl] = useState<string>("");
    const [urlArray, setUrlArray] = useState<string[]>([])
    const [demandedSkillInput, setdemandedSkillInput] = useState("")
    const [demandedSkillArray, setdemandedSkillArray] = useState<string[]>([])
    const [files, setFiles] = useState<File[]>([]);
    const [output, setOutput] = useState(null);

    const userMondodbId = JSON.parse(creatorId);
    const { organization } = useOrganization();

    useEffect(() => {
        if (!organization || orgId !== organization.id) return;
        // Simulate API call

    }, [organization, orgId]);

    const form = useForm<z.infer<typeof CreateJobOpeningValidation>>({
        resolver: zodResolver(CreateJobOpeningValidation),
        defaultValues: {
            title: "",
            description: "",
            attachment: "",
        },
    });

    const handleAttachment = (
        e: ChangeEvent<HTMLInputElement>,
        fieldChange: (value: string) => void
    ) => {
        e.preventDefault();

        const fileReader = new FileReader();

        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFiles(Array.from(e.target.files));

            if (!(file.type.includes("image"))) return;

            fileReader.onload = async (event) => {
                const fileDataUrl = event.target?.result?.toString() || "";
                fieldChange(fileDataUrl);
                console.log("attachment = ", fileDataUrl);
            };

            fileReader.readAsDataURL(file);
        }
    };



    const onSubmit = async (values: z.infer<typeof CreateJobOpeningValidation>) => {
        const imgRes = await startUpload(files);

        if (imgRes && imgRes.length > 0 && imgRes[0].url) {
            values.attachment = imgRes[0].url;
        }

        const obj = {
            orgId: orgId,
            creatorId: userMondodbId,
            title: values.title,
            description: values?.description || "",
            demandedSkills: demandedSkillArray,
            attachment: values?.attachment || "",
            urls: urlArray
        }
        // console.log("obj = ", obj)

        await createJobOpening({
            orgId: orgId,
            creatorId: userMondodbId,
            title: values.title,
            description: values?.description || "",
            demandedSkills: demandedSkillArray,
            attachment: values?.attachment || "",
            urls: urlArray
        });
        router.push(`/communities/${orgId}`);

    };

    if (!organization) return null;
    if (orgId !== organization.id) return null;

    return (
        <>

            <Form {...form}>
                <form
                    className='mt-10 flex flex-col justify-start gap-10'
                    onSubmit={form.handleSubmit(onSubmit)}
                >


                    {/* title */}
                    <FormField
                        control={form.control}
                        name='title'
                        render={({ field }) => (
                            <FormItem className='flex w-full flex-col gap-3'>
                                <FormLabel className='text-base-semibold text-black'>
                                    Title
                                </FormLabel>
                                <FormControl className='no-focus border text-light-1'>
                                    <Input type="text" {...field} className="bg-white text-black" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    {/* description */}
                    <FormField
                        control={form.control}
                        name='description'
                        render={({ field }) => (
                            <FormItem className='flex w-full flex-col gap-3'>
                                <FormLabel className='text-base-semibold text-black'>
                                    Description
                                </FormLabel>
                                <FormControl className='no-focus border text-light-1'>
                                    <Textarea rows={15} {...field} className="bg-white text-black" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />



                    {/* attachment */}
                    <FormField
                        control={form.control}
                        name='attachment'
                        render={({ field }) => (
                            <FormItem className='flex items-center gap-4'>
                                {/* <FormLabel className='text-base-semibold text-black'>
                                Attachment
                            </FormLabel> */}
                                <FormControl className='flex-1 text-base-semibold text-black'>
                                    <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Label htmlFor="picture">Add an Image</Label>
                                        <Input
                                            id="picture"
                                            type="file"
                                            accept='image/*'
                                            className='account-form_image-input'
                                            onChange={(e) => handleAttachment(e, field.onChange)}
                                            onClick={() => setFiles([])}
                                        />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <div className="max-w-[80%]">
                        <Image src={files[0] && URL.createObjectURL(files[0])}
                            layout='responsive'
                            width={0}
                            height={0}
                            alt='icon'
                            className={`max-w-[80%] h-auto ${files[0] ? "" : "hidden"}`}
                        />
                    </div>






                    {/* post url */}
                    <MultiValueInput
                        label="URLs"
                        placeholder="Enter URL"
                        inputItem={inputUrl}
                        setInputItem={setInputUrl}
                        itemArray={urlArray}
                        setItemArray={setUrlArray}
                    />

                    {/* demanded skills */}
                    <MultiValueInput
                        label="Demanded Skills"
                        placeholder="Enter Skills"
                        inputItem={demandedSkillInput}
                        setInputItem={setdemandedSkillInput}
                        itemArray={demandedSkillArray}
                        setItemArray={setdemandedSkillArray}
                    />




                    <Button type='submit' className='bg-primary-500'>
                        Create
                    </Button>

                </form>
            </Form>




        </>
    )
}

export default CreateJobOpening;