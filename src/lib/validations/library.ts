import { z } from "zod";
import {
  IMPRESSION,
  LIBRARY_PAGE_SIZE,
  LIBRARY_PAGE_SIZE_MAX,
  WATCH_STATUS,
} from "@/lib/constants";

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

export const seriesPatchSchema = z
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
    mark_season_to_watched: z.number().int().nonnegative().optional(),
    mark_episode_to_watched: z.number().int().nonnegative().optional(),
  })
  .superRefine((data, context) => {
    const hasSeason = data.mark_season_to_watched !== undefined;
    const hasEpisode = data.mark_episode_to_watched !== undefined;

    if (hasSeason !== hasEpisode) {
      context.addIssue({
        code: "custom",
        message:
          "mark_season_to_watched and mark_episode_to_watched must be provided together",
      });
    }

    if (
      data.watch_status === undefined &&
      data.impression === undefined &&
      !hasSeason &&
      !hasEpisode
    ) {
      context.addIssue({
        code: "custom",
        message: "No valid fields to update",
      });
    }
  });

function parsePageInt(value: unknown, fallback: number) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return Number(value);
}

export const libraryQuerySchema = z.object({
  type: z.enum(["movie", "series"]),
  offset: z.preprocess(
    (value) => parsePageInt(value, 0),
    z.number().int().min(0),
  ),
  limit: z.preprocess(
    (value) => parsePageInt(value, LIBRARY_PAGE_SIZE),
    z.number().int().min(1).max(LIBRARY_PAGE_SIZE_MAX),
  ),
});

export type MoviePatchInput = z.infer<typeof moviePatchSchema>;
export type SeriesPatchInput = z.infer<typeof seriesPatchSchema>;
export type LibraryQueryInput = z.infer<typeof libraryQuerySchema>;
