"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useOrganization } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";

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
import { useState, ChangeEvent } from "react";
import TagInput from "./TagInput";
import PostUrl from "./PostUrl";
import { useUploadThing } from "@/lib/validations/uploadthing";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Image from "next/image";


interface Props {
    userId: string;
}

function PostThread({ userId }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const { startUpload } = useUploadThing("media");
    const [tags, setTags] = useState<string[]>([]);
    const [urls, setUrls] = useState<string[]>([]);


    const [files, setFiles] = useState<File[]>([]);

    const { organization } = useOrganization();

    const form = useForm<z.infer<typeof ThreadValidation>>({
        resolver: zodResolver(ThreadValidation),
        defaultValues: {
            thread: "",
            accountId: userId,
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






    const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {


        const imgRes = await startUpload(files);

        if (imgRes && imgRes.length > 0 && imgRes[0].url) {
            values.attachment = imgRes[0].url;
        }

        await createThread({
            text: values.thread,
            author: userId,
            communityId: organization ? organization.id : null,
            path: pathname,
            tags: tags,
            urls: urls,
            attachment: values.attachment,
        });

        router.push("/");
        // console.log(tags)
        // console.log(urls)
    };

    return (
        <Form {...form}>
            <form
                className='mt-10 flex flex-col justify-start gap-10'
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FormField
                    control={form.control}
                    name='thread'
                    render={({ field }) => (
                        <FormItem className='flex w-full flex-col gap-3'>
                            <FormLabel className='text-base-semibold text-black'>
                                Content
                            </FormLabel>
                            <FormControl className='no-focus border text-light-1'>
                                <Textarea rows={15} {...field} className="bg-white text-black" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


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


                






                <TagInput tags={tags} setTags={setTags} />
                <PostUrl urls={urls} setUrls={setUrls} />

                <Button type='submit' className='bg-primary-500'>
                    Post
                </Button>
            </form>
        </Form>
    );
}

export default PostThread;