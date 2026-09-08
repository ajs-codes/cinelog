import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { getDb } from "@/db";
import { WATCH_STATUS, IMPRESSION } from "@/lib/constants";
import {
  series,
  seasons,
  creators,
  genres,
  seriesToGenres,
  credits,
  productionCompanies,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type TmdbCastMember = {
  id?: number;
  name?: string;
  order?: number;
  known_for_department?: string;
  [key: string]: unknown;
};

type TmdbCrewMember = {
  id?: number;
  name?: string;
  known_for_department?: string;
  [key: string]: unknown;
};

type TmdbContentRating = {
  iso_3166_1?: string;
  rating?: string;
  [key: string]: unknown;
};

type TmdbSeries = {
  backdrop_path?: string | null;
  created_by?: Array<{ id?: number; name?: string }> | null;
  first_air_date?: string;
  genres?: Array<{ id?: number; name?: string }> | null;
  id?: number;
  last_air_date?: string;
  name?: string;
  networks?: unknown[] | null;
  number_of_episodes?: number;
  number_of_seasons?: number;
  overview?: string;
  poster_path?: string | null;
  production_companies?: Array<{
    id?: number;
    name?: string;
    origin_country?: string;
  }> | null;
  seasons?: Array<{
    id?: number;
    name?: string;
    season_number?: number;
    episode_count?: number;
    air_date?: string;
  }> | null;
  status?: string;
  tagline?: string | null;
  type?: string;
  vote_average?: number;
  original_language?: string | null;
  origin_country?: string[] | null;
  content_ratings?: {
    results?: TmdbContentRating[];
  };
  imdb_id?: string | null;
  external_ids?: {
    imdb_id?: string | null;
  };
  credits?:
    | {
        cast?: TmdbCastMember[];
        crew?: TmdbCrewMember[];
      }
    | Array<{ id?: number; name?: string; known_for_department?: string }>;
};

function getSeriesFields(series: TmdbSeries) {
  const creditsObj =
    series.credits && !Array.isArray(series.credits)
      ? series.credits
      : undefined;
  const cast = [...(creditsObj?.cast ?? [])]
    .sort(
      (first, second) => (first.order ?? Infinity) - (second.order ?? Infinity),
    )
    .slice(0, 10);
  const directingCrew: TmdbCrewMember[] = [];

  for (const member of creditsObj?.crew ?? []) {
    if (member.known_for_department !== "Directing") continue;

    directingCrew.push(member);
    if (directingCrew.length === 5) break;
  }

  return {
    backdrop_path: series.backdrop_path,
    created_by: series.created_by ?? [],
    first_air_date: series.first_air_date,
    genres: series.genres ?? [],
    id: series.id,
    last_air_date: series.last_air_date,
    name: series.name,
    networks: series.networks ?? [],
    number_of_episodes: series.number_of_episodes,
    number_of_seasons: series.number_of_seasons,
    overview: series.overview,
    poster_path: series.poster_path,
    production_companies: series.production_companies ?? [],
    seasons: series.seasons ?? [],
    status: series.status,
    tagline: series.tagline,
    type: series.type,
    vote_average: series.vote_average,
    original_language: series.original_language,
    origin_country: series.origin_country ?? [],
    imdb_id: series.imdb_id ?? series.external_ids?.imdb_id,
    content_ratings:
      series.content_ratings?.results?.find(
        (rating) => rating.iso_3166_1 === "IN",
      ) ?? {},
    credits: [...cast, ...directingCrew],
  };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const seriesId = Number(id);

  if (!Number.isInteger(seriesId) || seriesId <= 0) {
    return NextResponse.json({ error: "Invalid series ID" }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key is not configured" },
      { status: 503 },
    );
  }

  const queryParams = new URLSearchParams({
    append_to_response: "external_ids,content_ratings,credits",
    language: "en-US",
  });

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${seriesId}?${queryParams.toString()}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "TMDB series request failed" },
        { status: response.status === 404 ? 404 : 502 },
      );
    }

    const series = (await response.json()) as TmdbSeries;
    return NextResponse.json(getSeriesFields(series));
  } catch {
    return NextResponse.json(
      { error: "TMDB series request failed" },
      { status: 502 },
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const tmdbId = Number(id);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return NextResponse.json({ error: "Invalid series ID" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = payload.userId;

  let body: TmdbSeries;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const db = getDb();

  try {
    const existing = await db
      .select()
      .from(series)
      .where(and(eq(series.tmdbId, tmdbId), eq(series.userId, userId)))
      .get();

    if (existing) {
      return NextResponse.json(
        { error: "Series already exists in library" },
        { status: 409 },
      );
    }

    await db.transaction(async (tx) => {
      let certificate = null;
      if (body.content_ratings?.results) {
        const ratingCountry =
          body.content_ratings.results.find((r) => r.iso_3166_1 === "IN") ??
          body.content_ratings.results.find(
            (r) => r.iso_3166_1 === body.origin_country?.[0],
          );
        certificate = ratingCountry?.rating ?? null;
      }

      const voteAvg =
        typeof body.vote_average === "number"
          ? Math.round(body.vote_average * 10)
          : null;
      const numEpisodes = body.number_of_episodes || null;
      const numSeasons = body.number_of_seasons || null;

      const [newSeries] = await tx
        .insert(series)
        .values({
          tmdbId,
          userId,
          name: body.name || "Unknown",
          posterPath: body.poster_path || null,
          firstAirDate: body.first_air_date || null,
          lastAirDate: body.last_air_date || null,
          totalNumberOfEpisodes: numEpisodes,
          totalNumberOfSeasons: numSeasons,
          voteAverage: voteAvg,
          status: body.status || null,
          originalLanguage: body.original_language || null,
          originCountry: Array.isArray(body.origin_country)
            ? body.origin_country[0]
            : null,
          certificate: certificate || null,
          type: body.type || null,
        })
        .returning();

      if (body.genres && Array.isArray(body.genres)) {
        for (const genre of body.genres) {
          if (!genre.id || !genre.name) continue;

          await tx
            .insert(genres)
            .values({
              tmdbId: genre.id,
              name: genre.name,
            })
            .onConflictDoNothing();

          const g = await tx
            .select()
            .from(genres)
            .where(eq(genres.tmdbId, genre.id))
            .get();
          if (g) {
            await tx
              .insert(seriesToGenres)
              .values({
                seriesId: newSeries.id,
                genreId: g.id,
              })
              .onConflictDoNothing();
          }
        }
      }

      if (body.seasons && Array.isArray(body.seasons)) {
        for (const season of body.seasons) {
          if (!season.id || season.season_number === undefined) continue;
          await tx.insert(seasons).values({
            seriesId: newSeries.id,
            tmdbId: season.id,
            name: season.name || null,
            seasonNumber: season.season_number,
            episodeCount: season.episode_count || 0,
            airDate: season.air_date || null,
            createdAt: String(Math.floor(Date.now() / 1000)),
          });
        }
      }

      if (body.created_by && Array.isArray(body.created_by)) {
        for (const creator of body.created_by) {
          if (!creator.id || !creator.name) continue;
          await tx.insert(creators).values({
            seriesId: newSeries.id,
            tmdbId: creator.id,
            name: creator.name,
          });
        }
      }

      if (body.credits && Array.isArray(body.credits)) {
        for (const credit of body.credits) {
          if (!credit.id || !credit.name) continue;
          await tx.insert(credits).values({
            seriesId: newSeries.id,
            tmdbId: credit.id,
            name: credit.name,
            knownForDepartment: credit.known_for_department || "Acting",
          });
        }
      } else if (body.credits?.cast || body.credits?.crew) {
        const allCredits = [
          ...(body.credits.cast || []),
          ...(body.credits.crew || []),
        ];
        for (const credit of allCredits) {
          if (!credit.id || !credit.name) continue;
          await tx.insert(credits).values({
            seriesId: newSeries.id,
            tmdbId: credit.id,
            name: credit.name,
            knownForDepartment: credit.known_for_department || "Acting",
          });
        }
      }

      if (
        body.production_companies &&
        Array.isArray(body.production_companies)
      ) {
        for (const company of body.production_companies) {
          if (!company.id || !company.name) continue;
          await tx.insert(productionCompanies).values({
            seriesId: newSeries.id,
            tmdbId: company.id,
            name: company.name,
            originCountry: company.origin_country || null,
          });
        }
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to insert series:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const tmdbId = Number(id);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return NextResponse.json({ error: "Invalid series ID" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = payload.userId;

  const db = getDb();

  try {
    const deleted = await db
      .delete(series)
      .where(and(eq(series.tmdbId, tmdbId), eq(series.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Series not found in library" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete series:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const tmdbId = Number(id);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return NextResponse.json({ error: "Invalid series ID" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = payload.userId;

  let body: {
    watch_status?: number;
    impression?: number | null;
    mark_season_to_watched?: number;
    mark_episode_to_watched?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const db = getDb();

  try {
    const existingSeries = await db
      .select()
      .from(series)
      .where(and(eq(series.tmdbId, tmdbId), eq(series.userId, userId)))
      .get();

    if (!existingSeries) {
      return NextResponse.json(
        { error: "Series not found in library" },
        { status: 404 },
      );
    }

    const now = String(Math.floor(Date.now() / 1000));

    await db.transaction(async (tx) => {
      let finalWatchStatus = existingSeries.watchStatus;
      let finalCompletedAt = existingSeries.completedAt;
      let finalLastWatchedAt = existingSeries.lastWatchedAt;
      let finalTotalEpsWatched =
        existingSeries.totalNumberOfEpisodesWatched || 0;
      let finalTotalSeasonsWatched =
        existingSeries.totalNumberOfSeasonsWatched || 0;

      let updateImpression = false;
      let newImpressionValue: number | null = existingSeries.impression;

      if (body.impression !== undefined) {
        const validImpressions: number[] = Object.values(IMPRESSION).map(
          (i) => i.value,
        );
        if (
          body.impression !== null &&
          !validImpressions.includes(body.impression)
        ) {
          throw new Error("Invalid impression");
        }
        updateImpression = true;
        newImpressionValue = body.impression;
      }

      const allSeasons = await tx
        .select()
        .from(seasons)
        .where(eq(seasons.seriesId, existingSeries.id))
        .all();

      let didProgressUpdate = false;

      if (
        body.mark_season_to_watched !== undefined &&
        body.mark_episode_to_watched !== undefined
      ) {
        const targetSeason = allSeasons.find(
          (s) => s.seasonNumber === body.mark_season_to_watched,
        );
        if (targetSeason) {
          let epsWatched = body.mark_episode_to_watched;
          if (epsWatched > targetSeason.episodeCount)
            epsWatched = targetSeason.episodeCount;
          if (epsWatched < 0) epsWatched = 0;

          const seasonCompletedAt =
            epsWatched === targetSeason.episodeCount && epsWatched > 0
              ? now
              : null;

          await tx
            .update(seasons)
            .set({
              episodesWatched: epsWatched,
              lastWatchedAt: now,
              completedAt: seasonCompletedAt,
              updatedAt: now,
            })
            .where(eq(seasons.id, targetSeason.id));

          targetSeason.episodesWatched = epsWatched;
          targetSeason.completedAt = seasonCompletedAt;
          targetSeason.lastWatchedAt = now;
          didProgressUpdate = true;
        }
      }

      if (body.watch_status !== undefined) {
        const validStatuses: number[] = Object.values(WATCH_STATUS).map(
          (s) => s.value,
        );
        if (!validStatuses.includes(body.watch_status)) {
          throw new Error("Invalid watch_status");
        }

        finalWatchStatus = body.watch_status;
        const planToWatchValue =
          Object.values(WATCH_STATUS).find(
            (s) => s.display_value === "Plan to Watch",
          )?.value ?? 0;
        const completedValue =
          Object.values(WATCH_STATUS).find(
            (s) => s.display_value === "Completed",
          )?.value ?? 2;

        if (finalWatchStatus === planToWatchValue) {
          finalTotalEpsWatched = 0;
          finalTotalSeasonsWatched = 0;
          finalCompletedAt = null;
          finalLastWatchedAt = null;

          await tx
            .update(seasons)
            .set({
              episodesWatched: 0,
              completedAt: null,
              lastWatchedAt: null,
              updatedAt: now,
            })
            .where(eq(seasons.seriesId, existingSeries.id));
        } else if (finalWatchStatus === completedValue) {
          finalCompletedAt = now;
          finalLastWatchedAt = now;
          finalTotalEpsWatched = existingSeries.totalNumberOfEpisodes || 0;
          finalTotalSeasonsWatched = existingSeries.totalNumberOfSeasons || 0;

          for (const s of allSeasons) {
            await tx
              .update(seasons)
              .set({
                episodesWatched: s.episodeCount,
                completedAt: now,
                lastWatchedAt: now,
                updatedAt: now,
              })
              .where(eq(seasons.id, s.id));
          }
        } else {
          finalCompletedAt = null;
        }
      } else if (didProgressUpdate) {
        finalTotalEpsWatched = allSeasons.reduce(
          (sum, s) => sum + s.episodesWatched,
          0,
        );
        finalTotalSeasonsWatched = allSeasons.filter(
          (s) => s.episodesWatched === s.episodeCount && s.episodeCount > 0,
        ).length;
        finalLastWatchedAt = now;

        const totalEps = existingSeries.totalNumberOfEpisodes || 0;
        if (totalEps > 0 && finalTotalEpsWatched >= totalEps) {
          const completedValue =
            Object.values(WATCH_STATUS).find(
              (s) => s.display_value === "Completed",
            )?.value ?? 2;
          finalWatchStatus = completedValue;
          finalCompletedAt = now;
        } else {
          const watchingValue =
            Object.values(WATCH_STATUS).find(
              (s) => s.display_value === "Watching",
            )?.value ?? 1;
          finalWatchStatus = watchingValue;
          finalCompletedAt = null;
        }
      }

      const seriesUpdate: Partial<typeof series.$inferInsert> = {
        watchStatus: finalWatchStatus,
        completedAt: finalCompletedAt,
        lastWatchedAt: finalLastWatchedAt,
        totalNumberOfEpisodesWatched: finalTotalEpsWatched,
        totalNumberOfSeasonsWatched: finalTotalSeasonsWatched,
        updatedAt: now,
      };

      if (updateImpression) {
        seriesUpdate.impression = newImpressionValue;
      }

      await tx
        .update(series)
        .set(seriesUpdate)
        .where(eq(series.id, existingSeries.id));
    });

    const updatedSeries = await db
      .select()
      .from(series)
      .where(and(eq(series.tmdbId, tmdbId), eq(series.userId, userId)))
      .get();

    return NextResponse.json({ success: true, data: updatedSeries }, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to update series:", error);
    if (
      error instanceof Error &&
      (error.message === "Invalid impression" ||
        error.message === "Invalid watch_status")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
