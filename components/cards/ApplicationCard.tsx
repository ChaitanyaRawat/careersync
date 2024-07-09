"use client"

import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from "../ui/accordion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"
import { downloadPDF } from "@/lib/utils"
import { acceptApplication, rejectApplication } from "@/lib/actions/company.actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Loader from "../shared/Loader"

const ApplicationCard = ({ oid, userOid, userImage, name, resume, clerkId, accepted }: { oid: string, userOid: string, userImage: string, name: string, resume: string, clerkId: string, accepted: boolean }) => {
    
    const router = useRouter()
    const [isLoading, setisLoading] = useState<boolean>(false)
   
    return (
        <article className="flex w-full flex-col bg-white   p-7 rounded-xl  my-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <Link href={`/profile/${clerkId}`} className='relative h-11 w-11'>
                    <Image
                        src={userImage}
                        alt='user_company_image'
                        fill
                        className='cursor-pointer rounded-full'
                    />
                </Link>
                <p className="font-bold text-primary-500">{name}</p>
                <a
                    className="bg-primary-500 text-white text-sm font-bold justify-self-end p-2 rounded-lg hover:bg-black"
                    href={`${resume}`}
                    target="_blank"
                >
                    View Resume in another tab
                </a>
                <Button
                    className="bg-primary-500 text-white text-sm font-bold justify-self-end hover:bg-black"
                    onClick={async () => {
                        setisLoading(true)
                        await downloadPDF({ fileUrl: resume, fileName: clerkId })
                       
                       setisLoading(false)
                    }}
                >
                    Download Resume
                </Button>
                {!accepted && (
                    <Button
                        className="bg-green-500 text-white text-sm font-bold justify-self-end hover:bg-black"
                        onClick={async () => {
                            setisLoading(true)
                            await acceptApplication({ oid, userOid })
                            router.refresh()
                            setisLoading(false)
                        }}
                    >
                        Accept
                    </Button>
                )
                }
                {

                    accepted && (
                        <Button
                            className="bg-red-500 text-white text-sm font-bold justify-self-end hover:bg-black"
                            onClick={async () => {
                                setisLoading(true)
                                await rejectApplication({ oid, userOid })
                                router.refresh()
                                setisLoading(false)
                            }}
                        >
                            Reject
                        </Button>
                    )
                }

            </div>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-black text-center">View Resume</AccordionTrigger>
                    <AccordionContent>
                        <div className={`max-w-[80%] h-[600px] `}>

                            <iframe src={resume} width="100%" className={`max-w-[80%] h-full } mx-auto`} />

                        </div>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>
            {isLoading && <Loader />}
        </article>

    )
}

export default ApplicationCard