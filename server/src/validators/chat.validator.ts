import { z } from "zod";

export const chatSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question cannot be empty")
    .max(5000, "Question cannot exceed 5000 characters"),

  conversationId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid conversation ID")
    .optional(),

  documentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid document ID")
    .optional(),
});

export type ChatInput = z.infer<typeof chatSchema>;
