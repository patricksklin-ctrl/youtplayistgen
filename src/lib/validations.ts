import { z } from "zod";

export const searchCriteriaSchema = z.object({
  keywords: z
    .string()
    .min(3, "Keywords must be at least 3 characters")
    .max(100, "Keywords must be less than 100 characters"),
  recency: z.object({
    value: z
      .number()
      .int()
      .min(1, "Must be at least 1")
      .max(365, "Must be less than 365"),
    unit: z.enum(["days", "weeks", "months"]),
  }),
  minViews: z
    .number()
    .int()
    .min(0, "Cannot be negative")
    .max(1_000_000_000, "Value too large"),
  language: z.string().length(2, "Must be a valid ISO 639-1 language code"),
  duration: z
    .object({
      min: z
        .number()
        .int()
        .min(0, "Cannot be negative")
        .max(600, "Must be less than 600 minutes"),
      max: z
        .number()
        .int()
        .min(1, "Must be at least 1")
        .max(600, "Must be less than 600 minutes"),
    })
    .refine((d) => d.max > d.min, {
      message: "Max duration must be greater than min duration",
    }),
  target: z.object({
    type: z.enum(["videos", "minutes"]),
    value: z
      .number()
      .int()
      .min(1, "Must be at least 1")
      .max(500, "Value too large"),
  }),
  playlistTitle: z
    .string()
    .min(1, "Playlist title is required")
    .max(150, "Title must be less than 150 characters"),
  playlistPrivacy: z.enum(["public", "unlisted", "private"]),
});

export type SearchCriteriaInput = z.infer<typeof searchCriteriaSchema>;
