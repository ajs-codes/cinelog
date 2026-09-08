import { z } from "zod";
import { IMPRESSION, WATCH_STATUS } from "@/lib/constants";

const watchStatusValues: number[] = Object.values(WATCH_STATUS).map(
  (status) => status.value,
);
const impressionValues: number[] = Object.values(IMPRESSION).map(
  (impression) => impression.value,
);

export const moviePatchSchema = z
  .object({
    watch_status: z
      .number()
      .refine((value) => watchStatusValues.includes(value), {
        message: "Invalid watch_status",
      })
      .optional(),
    impression: z
      .union([
        z.null(),
        z.number().refine((value) => impressionValues.includes(value), {
          message: "Invalid impression",
        }),
      ])
      .optional(),
  })
  .refine(
    (data) =>
      data.watch_status !== undefined || data.impression !== undefined,
    { message: "No valid fields to update" },
  );

export const seriesPatchSchema = z.object({
  watch_status: z
    .number()
    .refine((value) => watchStatusValues.includes(value), {
      message: "Invalid watch_status",
    })
    .optional(),
  impression: z
    .union([
      z.null(),
      z.number().refine((value) => impressionValues.includes(value), {
        message: "Invalid impression",
      }),
    ])
    .optional(),
  mark_season_to_watched: z.number().optional(),
  mark_episode_to_watched: z.number().optional(),
});

export type MoviePatchInput = z.infer<typeof moviePatchSchema>;
export type SeriesPatchInput = z.infer<typeof seriesPatchSchema>;
