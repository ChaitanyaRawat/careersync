import { generateReactHelpers } from "@uploadthing/react";
// import { UTApi } from "uploadthing/server";
 

import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const { useUploadThing, uploadFiles } =
generateReactHelpers<OurFileRouter>();

// export const utapi = new UTApi();







// import {
//     generateUploadButton,
//     generateUploadDropzone,
//   } from "@uploadthing/react";
   
//   import type { OurFileRouter } from "@/app/api/uploadthing/core";
   
//   export const UploadButton = generateUploadButton<OurFileRouter>();
//   export const UploadDropzone = generateUploadDropzone<OurFileRouter>();