import { OrganizationSwitcher, SignedIn, SignOutButton } from "@clerk/nextjs";

import Image from "next/image";
import Link from "next/link";

function Topbar() {
    return (
        <nav className='topbar'>
            <Link href='/' className='flex items-center'>
                <Image src='/logo-icon.png' alt='logo' width={40} height={100} />
                <p className='text-heading4-medium font-bold text-light-1 max-xs:hidden'>CareerSync</p>
            </Link>

            <div className='flex items-center gap-1'>
                <div className='block md:hidden'>
                    <SignedIn>
                        <SignOutButton>
                            <div className='flex cursor-pointer'>
                                <Image
                                    src='/assets/logout.svg'
                                    className="invert"
                                    alt='logout'
                                    width={24}
                                    height={24}
                                />
                            </div>
                        </SignOutButton>
                    </SignedIn>
                </div>

                <OrganizationSwitcher
                    appearance={{
                     variables: {
                         colorText: "black",
                     },
                        elements: {
                            organizationSwitcherTrigger: "py-2 px-4",
                        },
                    }}
                    
                />
            </div>
        </nav>
    );
}

export default Topbar;