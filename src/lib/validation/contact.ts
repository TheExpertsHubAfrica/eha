import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().min(3, "Add a short subject."),
  message: z
    .string()
    .trim()
    .min(20, "Please include a little more detail (at least 20 characters).")
    .max(4000, "Please keep the message under 4,000 characters."),
  website: z.string().max(0).optional(),
  offer: z.string().optional(),
  intent: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
