import * as z from "zod";

export const CreateJobOpeningValidation = z.object({
    title: z.string().nonempty().min(3, { message: "Minimum 3 characters." }),
    description: z.string().optional(),
    // demanded skills will be an array of strings
    attachment: z.string().optional(),
    // urls will also be an array of strings
});