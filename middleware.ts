// important note: authmiddleware(which protects all routes by default) was discontinued 
// and is replaced with clerkmiddleware (which doesn't protect routes by default)
// if you want to protect all routes and and allow only specific routes,then do this

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/api/webhooks(.*)',"/sign-in(.*)", "/sign-up(.*)","/api/uploadthing(.*)"]); // put those routes that you don't want to protect

export default clerkMiddleware((auth, request) => {
    if (!isPublicRoute(request)) { // if request is not a public route
        auth().protect();  // then check if user is authenticated after let only authenticated users in and redirect the unauthenticated users to sign in
    }
});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};