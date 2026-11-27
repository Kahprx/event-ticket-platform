import { z } from "zod";

export const askQuestionSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(500, "Message is too long"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().max(2000),
        artist: z.string().max(120).optional(),
      }),
    )
    .max(10, "History is too long")
    .default([]),
});
