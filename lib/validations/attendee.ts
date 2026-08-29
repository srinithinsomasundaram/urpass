import { z } from "zod";

export const PASS_TYPES = ["participant", "vip", "speaker", "organizer"] as const;

export const attendeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  pass_type: z.enum(PASS_TYPES, {
    errorMap: () => ({ message: "Select a valid pass type" }),
  }),
});

export type AttendeeInput = z.infer<typeof attendeeSchema>;
