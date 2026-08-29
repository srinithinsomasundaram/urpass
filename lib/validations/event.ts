import { z } from "zod";

export const eventSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  event_date: z.string().min(1, "Event date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  venue: z.string().min(2, "Venue must be at least 2 characters"),
  attendee_limit: z
    .number({ invalid_type_error: "Must be a number" })
    .int()
    .positive("Must be greater than 0")
    .max(100_000, "Maximum 100,000 attendees"),
  status: z.enum(["draft", "active"]),
  application_enabled: z.boolean(),
  auto_approve: z.boolean(),
});

export type EventInput = z.infer<typeof eventSchema>;
