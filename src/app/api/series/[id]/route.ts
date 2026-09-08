import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { getDb } from "@/db";
import {
  series,
  seasons,
  creators,
  genres,
  seriesToGenres,
  credits,
  productionCompanies,
} from "@/db/schema";
import { WATCH_STATUS, IMPRESSION } from "@/lib/constants";
import { eq, and } from "drizzle-orm";
import type {
  RouteContext,
  TmdbCrewMember,
  TmdbSeries,
} from "@/lib/types";

export const dynamic = "force-dynamic";

async function getSeriesFields(
  seriesRecord: TmdbSeries,
  tmdbId: number,
  userId?: number,
) {
  const creditsObj =
    seriesRecord.credits && !Array.isArray(seriesRecord.credits)
      ? seriesRecord.credits
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

  const userSeries = userId
    ? await getDb()
        .select({ impression: series.impression })
        .from(series)
        .where(and(eq(series.tmdbId, tmdbId), eq(series.userId, userId)))
        .get()
    : undefined;

  return {
    backdrop_path: seriesRecord.backdrop_path,
    created_by: seriesRecord.created_by ?? [],
    first_air_date: seriesRecord.first_air_date,
    genres: seriesRecord.genres ?? [],
    id: seriesRecord.id,
    last_air_date: seriesRecord.last_air_date,
    name: seriesRecord.name,
    networks: seriesRecord.networks ?? [],
    number_of_episodes: seriesRecord.number_of_episodes,
    number_of_seasons: seriesRecord.number_of_seasons,
    overview: seriesRecord.overview,
    poster_path: seriesRecord.poster_path,
    production_companies: seriesRecord.production_companies ?? [],
    seasons: seriesRecord.seasons ?? [],
    status: seriesRecord.status,
    tagline: seriesRecord.tagline,
    type: seriesRecord.type,
    vote_average: seriesRecord.vote_average,
    original_language: seriesRecord.original_language,
    origin_country: seriesRecord.origin_country ?? [],
    imdb_id: seriesRecord.imdb_id ?? seriesRecord.external_ids?.imdb_id,
    content_ratings:
      seriesRecord.content_ratings?.results?.find(
        (rating) => rating.iso_3166_1 === "IN",
      ) ?? {},
    credits: [...cast, ...directingCrew],
    is_present_in_watchlist: Boolean(userSeries),
    impression: userSeries?.impression ?? null,
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

    const seriesData = (await response.json()) as TmdbSeries;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const payload = token ? await verifyToken(token) : null;
    return NextResponse.json(
      await getSeriesFields(seriesData, seriesId, payload?.userId),
    );
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

  let body: { watch_status?: number; impression?: number | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const updateData: Partial<typeof series.$inferInsert> = {
    updatedAt: String(Math.floor(Date.now() / 1000)),
  };

  if (body.watch_status !== undefined) {
    const validStatuses: number[] = Object.values(WATCH_STATUS).map(
      (status) => status.value,
    );
    if (!validStatuses.includes(body.watch_status)) {
      return NextResponse.json(
        { error: "Invalid watch_status" },
        { status: 400 },
      );
    }
    updateData.watchStatus = body.watch_status;
    const completedValue =
      Object.values(WATCH_STATUS).find(
        (status) => status.display_value === "Completed",
      )?.value ?? 2;
    updateData.completedAt =
      body.watch_status === completedValue ? updateData.updatedAt : null;
  }

  if (body.impression !== undefined) {
    const validImpressions: number[] = Object.values(IMPRESSION).map(
      (impression) => impression.value,
    );
    if (
      body.impression !== null &&
      !validImpressions.includes(body.impression)
    ) {
      return NextResponse.json(
        { error: "Invalid impression" },
        { status: 400 },
      );
    }
    updateData.impression = body.impression;
  }

  if (Object.keys(updateData).length === 1) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  try {
    const updated = await getDb()
      .update(series)
      .set(updateData)
      .where(and(eq(series.tmdbId, tmdbId), eq(series.userId, payload.userId)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Series not found in library" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to update series:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
