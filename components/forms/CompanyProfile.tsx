"use client"
import { useOrganization } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import * as z from "zod";
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useState } from 'react';
import { updateCommunityInfo } from '@/lib/actions/community.actions';
import Loader from '../shared/Loader';
import { useRouter } from 'next/navigation';

const CommunityValidation = z.object({
    bio: z.string().nonempty().min(3, { message: "Minimum 3 characters." }),
    websiteUrl: z.string(),
});

const CompanyProfile = ({ orgInfo }: { orgInfo: string }) => {
    const router = useRouter();
    const [isLoading, setisLoading] = useState<boolean>(false);
    const { organization } = useOrganization();
    const orgDetails = JSON.parse(orgInfo);

    const form = useForm<z.infer<typeof CommunityValidation>>({
        resolver: zodResolver(CommunityValidation),
        defaultValues: {
            bio: orgDetails.bio || "",
            websiteUrl: orgDetails.websiteUrl || "",
        },
    });

    if (!organization) return null;
    const currOrgId = organization.id;
    if (orgDetails.id !== currOrgId) return null;
    
    // console.log("orgDetails = ", orgDetails);

    const onSubmit = async (values: z.infer<typeof CommunityValidation>) => {
        console.log("values = ", values);
        setisLoading(true);
        await updateCommunityInfo(orgDetails.id, orgDetails.name, orgDetails.username, orgDetails.image, values.bio, values.websiteUrl);
        // delay
        setTimeout(() => {
            
        }, 1000);
        router.push(`/communities/${orgDetails.id}`);
        setisLoading(false);
    };
    return (
        <>
            <Form {...form}>
                <form
                    className='flex flex-col justify-start gap-10 bg-white p-4 rounded-lg my-4'
                    onSubmit={form.handleSubmit(onSubmit)}
                >

                    <FormField
                        control={form.control}
                        name='bio'
                        render={({ field }) => (
                            <FormItem className='flex w-full flex-col gap-3 bg-white p-4 rounded-lg'>
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

                    <FormField
                        control={form.control}
                        name='websiteUrl'
                        render={({ field }) => (
                            <FormItem className='flex w-full flex-col gap-3 bg-white p-4 rounded-lg'>
                                <FormLabel className='text-base-semibold text-black'>
                                    Website URL
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
                    <Button type='submit' className='bg-primary-500 font-bold'>
                        Save changes
                    </Button>
                </form>
            </Form>
            {isLoading && <Loader />}
        </>
    )
}

export default CompanyProfile