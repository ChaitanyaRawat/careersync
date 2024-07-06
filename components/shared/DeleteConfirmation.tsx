"use client";

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteUser } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Loader from "./Loader";



export const DeleteConfirmation = ({ userId }: { userId: string }) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [isLoading, setisLoading] = useState<boolean>(false)
    return (
        <>
            <AlertDialog>
                <AlertDialogTrigger asChild className="rounded-full bg-red-500 w-full">
                    <button className="flex w-full items-center justify-center p-0.5 my-4 me-2 hover:bg-black overflow-hidden text-sm font-medium text-white rounded-xl ">
                        <span className=" px-5 py-1 bg-opacity-0 font-bold">
                            Delete account
                        </span>
                    </button>
                </AlertDialogTrigger>

                <AlertDialogContent className="flex flex-col gap-10 bg-white text-black">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="mx-auto">
                            Are you sure you want to delete this Account ?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-bold text-[16px] leading-[140%] mx-auto">
                            The Account will be permanently deleted
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="mx-auto">
                        <AlertDialogCancel className="bg-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className=" bg-red-500 text-white hover:bg-red-700"
                            onClick={() =>
                                startTransition(async () => {
                                    setisLoading(true)
                                    await deleteUser(userId);
                                    router.push("/sign-up");
                                    setisLoading(false)
                                })
                            }
                        >
                            {isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {isLoading && <Loader />}
        </>
    );
};