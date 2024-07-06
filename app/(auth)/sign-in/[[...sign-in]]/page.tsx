import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (


        <div className="min-h-screen  flex justify-center">
            <div className="w-full m-0  bg-gray-100 shadow  flex justify-center flex-1">
                <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 flex justify-center items-center">
                   <SignIn />
                </div>
                <div className="flex-1 bg-[url('/sign-in-image.jpg')] bg-cover bg-center bg-no-repeat text-center hidden lg:flex">
                    
                </div>
            </div>
        </div>

    );
}