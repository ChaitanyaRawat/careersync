"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignOutButton, SignedIn, useAuth, useOrganization } from "@clerk/nextjs";
import Script from "next/script";

import { sidebarLinks } from "@/constants";

const LeftSidebar = () => {
    const router = useRouter();
    const pathname = usePathname();
    
    const { userId } = useAuth();

    return (
        <>
            <Script src="https://cdn.lordicon.com/lordicon.js"></Script>
            <section className='custom-scrollbar leftsidebar'>
                <div className='flex w-full flex-1 flex-col gap- px-6'>
                    {sidebarLinks.map((link) => {
                        const isActive =
                            (pathname.includes(link.route) && link.route.length > 1) ||
                            pathname === link.route;

                        if (link.route === "/profile") link.route = `${link.route}/${userId}`;

                        return (
                            <Link
                                href={link.route}
                                key={link.label}
                                className={`leftsidebar_link ${isActive && "bg-primary-500"}`}
                            >
                                <Image
                                    src={link.imgURL}
                                    alt={link.label}
                                    width={24}
                                    height={24}
                                    className={`${isActive && "invert"}`}
                                />


                                <p className={`${isActive ? "text-white" : "text-black"} max-lg:hidden`} >{link.label}</p>
                            </Link>
                        );
                    })}

                    {/* {organization && (
                        <Link
                            href={`createJobOpening/${organization.id}`}
                            className={`leftsidebar_link ${pathname.includes("/createJobOpening") && "bg-primary-500"}`}
                        >
                            <Image
                                src="/assets/skills.svg"
                                alt={"createJobOpening"}
                                width={24}
                                height={24}
                                className={`${!pathname.includes("/createJobOpening") && "invert"}`}
                            />


                            <p className={`${pathname.includes("/createJobOpening") ? "text-white" : "text-black"} max-lg:hidden`} >Create Job Opening</p>
                        </Link>
                    )
                    } */}


                </div>

                <div className='mt-10 px-6'>
                    <SignedIn>
                        <SignOutButton redirectUrl="/sign-in" >
                            <div className='flex cursor-pointer gap-4 p-4'>
                                <Image
                                    src='/assets/logout.svg'
                                   
                                    alt='logout'
                                    width={24}
                                    height={24}
                                />

                                <p className='text-black max-lg:hidden'>Logout</p>
                            </div>
                        </SignOutButton>
                    </SignedIn>
                </div>
            </section>
        </>
    );
};

export default LeftSidebar;