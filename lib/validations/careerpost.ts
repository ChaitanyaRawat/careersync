import * as z from "zod";

export const CareerpostValidation = z.object({
  careerpost: z.string().nonempty().min(3, { message: "Minimum 3 characters." }),
  accountId: z.string(),
  attachment: z.string().optional(),
});

export const CommentValidation = z.object({
  careerpost: z.string().nonempty().min(3, { message: "Minimum 3 characters." }),
});
