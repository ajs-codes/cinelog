import { z } from "zod";

export const movieInputSchema = z.object({
  title: z.string().trim().min(1).max(255),
  year: z.coerce.number().int().min(1888).max(3000).optional(),
  genre: z.string().trim().max(100).optional(),
  watched: z.boolean().optional(),
});

export type MovieInput = z.infer<typeof movieInputSchema>;
