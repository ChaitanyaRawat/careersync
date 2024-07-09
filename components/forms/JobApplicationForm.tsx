"use client"
import { zodResolver } from '@hookform/resolvers/zod';
import React, { ChangeEvent, useState } from 'react'
import { useForm } from 'react-hook-form';
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { useUploadThing } from '@/lib/validations/uploadthing';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '../ui/use-toast';
import { addApplication } from '@/lib/actions/company.actions';
import Loader from '../shared/Loader';

export const JobApplicationValidation = z.object({

    resume: z.string()
});

const JobApplicationForm = ({ orgId, oid, userOid }: { orgId: string, oid: string, userOid: string }) => {
    const router = useRouter();
    const { toast } = useToast()
    const { startUpload } = useUploadThing("docMedia");
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [files, setFiles] = useState<File[]>([]);
    const form = useForm<z.infer<typeof JobApplicationValidation>>({
        resolver: zodResolver(JobApplicationValidation),
        defaultValues: {
            resume: '',
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
               
            };

            fileReader.readAsDataURL(file);
        }
    };


    const onSubmit = async (values: z.infer<typeof JobApplicationValidation>) => {
        setIsLoading(true)
        if (files.length === 0) {
            toast({
                title: "Please Upload Resume",
                className: "text-sm font-bold text-red-500",
            })
            return
        }
        const docRes = await startUpload(files);

        if (docRes && docRes.length > 0 && docRes[0].url) {
            values.resume = docRes[0].url;
        }
        await addApplication({ oid: oid, userOid: JSON.parse(userOid), resume: values.resume })



        await router.push(`/companies/${orgId}`);
        toast({
            title: "You Have succesfully applied for this job",
            className: "text-sm font-bold text-green-500",
        })
        setIsLoading(false)
    }



    return (
        <>
            <div>

                <Form {...form}>
                    <form
                        className='mt-10 flex flex-col justify-start gap-10'
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FormField
                            control={form.control}
                            name='resume'
                            render={({ field }) => (
                                <FormItem className='flex items-center gap-4'>

                                    <FormControl className='flex-1 text-base-semibold text-black'>
                                        <div className="grid w-full max-w-sm items-center gap-1.5">
                                            <Label htmlFor="resume">Upload Resume</Label>
                                            <Input
                                                id="resume"
                                                type="file"
                                                accept='.pdf'
                                                className='account-form_image-input'
                                                onChange={(e) => handleAttachment(e, field.onChange)}
                                                onClick={() => setFiles([])}
                                            />
                                            {/* <FormMessage></FormMessage> */}
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className={`max-w-[80%] h-[600px] ${files[0] ? "" : "hidden"}`}>

                            <iframe src={files[0] && URL.createObjectURL(files[0])} width="100%" className={`max-w-[80%] h-full ${files[0] ? "" : "hidden"}`} />

                        </div>
                        

                        <Button type='submit' className='bg-primary-500'>
                            Submit
                        </Button>

                    </form>
                </Form>
            </div>
            {

                isLoading ? <Loader /> : ""
            }
            
        </>
    )
}

export default JobApplicationForm