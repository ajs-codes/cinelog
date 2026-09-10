import "dotenv/config";

import { isAbsolute, resolve } from "node:path";
import { createInterface, type Interface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { WATCH_STATUS, TMDB_POSTER_BASE_URL } from "@/lib/constants";
import { isUniqueConstraintError } from "@/lib/db/unique-constraint";
import { nowUnixSeconds } from "@/lib/media/display";
import type { TmdbSeries } from "@/lib/types";
import type { Season } from "@/db/schema";
import { findUserById } from "@/repositories/users";
import {
  applySeriesWatchUpdates,
  findUserSeriesAndSeasons,
  insertUserSeries,
} from "@/repositories/series";
import { getSeriesDetails } from "@/services/series";
import { searchTitles } from "@/services/search";

import { readCsvFile, writeCsvFile } from "./lib/csv";

const PLAN_TO_WATCH_STATUS = WATCH_STATUS[0].value;
const WATCHING_STATUS = WATCH_STATUS[1].value;
const COMPLETED_STATUS = WATCH_STATUS[2].value;

const IMPORTED = "imported";
const IGNORED = "ignored";
const REJECTED_PREFIX = "rejected";

type CsvColumn =
  | "Title"
  | "Auto Status"
  | "Release Year"
  | "Completed Date"
  | "Last Watched Date"
  | "No of Episodes Watched"
  | "Imported";

type SearchResult = Awaited<ReturnType<typeof searchTitles>>["results"][number];
type SeriesDetails = Awaited<ReturnType<typeof getSeriesDetails>>;

class QuitImport extends Error {
  constructor() {
    super("Import cancelled");
    this.name = "QuitImport";
  }
}

const columns: Record<CsvColumn, number> = {
  Title: -1,
  "Auto Status": -1,
  "Release Year": -1,
  "Completed Date": -1,
  "Last Watched Date": -1,
  "No of Episodes Watched": -1,
  Imported: -1,
};

let csvPath = "";
let table: string[][] = [];
let shuttingDown = false;

function printUsage() {
  console.log(
    "Usage: yarn import:series --csv <path-to-csv> --user-id <id>",
  );
}

function parseArgs(argv: string[]) {
  let csv: string | undefined;
  let userId: number | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }

    if (arg === "--csv") {
      csv = argv[index + 1];
      if (!csv || csv.startsWith("--")) {
        throw new Error("--csv requires a file path");
      }
      index += 1;
      continue;
    }

    if (arg === "--user-id") {
      const raw = argv[index + 1];
      if (!raw || raw.startsWith("--")) {
        throw new Error("--user-id requires a positive integer");
      }
      const parsed = Number(raw);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error("--user-id must be a positive integer");
      }
      userId = parsed;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!csv || userId === undefined) {
    printUsage();
    throw new Error("Both --csv and --user-id are required");
  }

  return { csv, userId };
}

function resolveColumns(header: string[]) {
  const required: Exclude<CsvColumn, "Imported">[] = [
    "Title",
    "Auto Status",
    "Release Year",
    "Completed Date",
    "Last Watched Date",
    "No of Episodes Watched",
  ];

  required.forEach((name) => {
    const index = header.findIndex(
      (cell) => cell.replace(/^\uFEFF/, "").trim() === name,
    );
    if (index === -1) {
      throw new Error(`CSV is missing required column: ${name}`);
    }
    columns[name] = index;
  });

  const importedIndex = header.findIndex(
    (cell) => cell.replace(/^\uFEFF/, "").trim() === "Imported",
  );
  if (importedIndex === -1) {
    columns.Imported = header.length;
    header.push("Imported");
  } else {
    columns.Imported = importedIndex;
  }
}

function cell(row: string[], name: CsvColumn) {
  return (row[columns[name]] ?? "").trim();
}

function setImported(rowIndex: number, value: string) {
  const row = table[rowIndex];
  const importedIndex = columns.Imported;
  while (row.length <= importedIndex) {
    row.push("");
  }
  row[importedIndex] = value;
  writeCsvFile(csvPath, table);
  console.log(`  CSV updated: ${cell(row, "Title") || "(untitled)"} → ${value}`);
}

function importedValue(row: string[]) {
  return cell(row, "Imported").toLowerCase();
}

function isFinished(row: string[]) {
  const value = importedValue(row);
  return value === IMPORTED || value === IGNORED;
}

function isDropped(row: string[]) {
  return cell(row, "Auto Status").toLowerCase() === "dropped";
}

function watchStatusForRow(row: string[]) {
  const status = cell(row, "Auto Status").toLowerCase();
  if (status === "to watch") return PLAN_TO_WATCH_STATUS;
  if (status === "watching") return WATCHING_STATUS;
  if (status === "watched") return COMPLETED_STATUS;
  return null;
}

function parseUnixSeconds(value: string, fallback?: string) {
  const trimmed = value.trim();
  if (!trimmed) return fallback ?? nowUnixSeconds();

  const milliseconds = Date.parse(trimmed);
  if (Number.isNaN(milliseconds)) return fallback ?? nowUnixSeconds();

  return String(Math.floor(milliseconds / 1000));
}

function parseEpisodesWatched(value: string) {
  const parsed = Number(value.trim());
  if (!Number.isInteger(parsed) || parsed < 0) return 0;
  return parsed;
}

function wrapText(text: string, width = 88) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 4);
}

async function promptLine(rl: Interface, question: string) {
  if (shuttingDown) throw new QuitImport();

  try {
    const answer = (await rl.question(question)).trim();
    if (shuttingDown) throw new QuitImport();
    if (answer.toLowerCase() === "q") throw new QuitImport();
    return answer;
  } catch (error) {
    if (error instanceof QuitImport) throw error;
    throw new QuitImport();
  }
}

function printDivider() {
  console.log("------------------------------------------------------------");
}

function normalizeTitle(value: string) {
  return value.trim().toLowerCase();
}

function matchesCsvYear(result: SearchResult, csvYear: string) {
  const year = csvYear.trim();
  return year.length > 0 && result.release_date === year;
}

function matchesCsvTitle(result: SearchResult, csvTitle: string) {
  const title = result.title?.trim() ?? "";
  return title.length > 0 && normalizeTitle(title) === normalizeTitle(csvTitle);
}

function findExactNameAndYearMatches(
  results: SearchResult[],
  csvTitle: string,
  csvYear: string,
) {
  return results.filter(
    (result) =>
      result.id !== undefined &&
      matchesCsvTitle(result, csvTitle) &&
      matchesCsvYear(result, csvYear),
  );
}

function pickSearchResults(results: SearchResult[], csvYear: string) {
  const pageResults = results.filter((result) => result.id !== undefined);
  if (pageResults.length <= 5) return pageResults;

  const yearMatches = pageResults.filter((result) =>
    matchesCsvYear(result, csvYear),
  );

  if (yearMatches.length === 0 || yearMatches.length === pageResults.length) {
    return pageResults.slice(0, 20);
  }

  const [bestMatch] = yearMatches;
  const remaining = pageResults
    .filter((result) => result.id !== bestMatch.id)
    .slice(0, 4);

  return [bestMatch, ...remaining];
}

function printSearchResult(
  index: number,
  result: SearchResult,
  csvYear: string,
) {
  const year = result.release_date || "—";
  const yearMatch =
    csvYear && year && csvYear === year ? "  [year match]" : "";
  const rating =
    typeof result.vote_average === "number"
      ? result.vote_average.toFixed(1)
      : "—";
  const watchlist = result.is_present_in_watchlist ? "yes" : "no";
  const genres = result.genres.length > 0 ? result.genres.join(", ") : "—";

  console.log(
    `\n[${index}] ${result.title ?? "Untitled"} (${year})  ★ ${rating}${yearMatch}`,
  );
  console.log(`    TMDB id: ${result.id ?? "—"}`);
  console.log(`    Language: ${result.original_language ?? "—"}`);
  console.log(`    Genres: ${genres}`);
  console.log(`    In watchlist: ${watchlist}`);
  console.log(`    Poster: ${result.poster_path ?? "(none)"}`);
  if (result.overview) {
    for (const line of wrapText(result.overview)) {
      console.log(`    ${line}`);
    }
  }
}

function printSeriesDetails(details: SeriesDetails) {
  const year = details.first_air_date?.slice(0, 4) || "—";
  const rating =
    typeof details.vote_average === "number"
      ? details.vote_average.toFixed(1)
      : "—";
  const genres =
    details.genres?.map((genre) => genre.name).filter(Boolean).join(", ") ||
    "—";
  const countries = details.origin_country?.join(", ") || "—";
  const credits =
    details.credits
      ?.map((credit) => credit.name)
      .filter(Boolean)
      .slice(0, 8)
      .join(", ") || "—";
  const companies =
    details.production_companies
      ?.map((company) => company.name)
      .filter(Boolean)
      .slice(0, 6)
      .join(", ") || "—";
  const poster = details.poster_path
    ? details.poster_path.startsWith("http")
      ? details.poster_path
      : `${TMDB_POSTER_BASE_URL}${details.poster_path}`
    : null;
  const regularSeasonCount = (details.seasons ?? []).filter(
    (season) => (season.season_number ?? 0) > 0,
  ).length;

  printDivider();
  console.log(`${details.name ?? "Untitled"} (${year})  ★ ${rating}`);
  console.log(`TMDB id: ${details.id ?? "—"}`);
  console.log(`Status: ${details.status ?? "—"}`);
  console.log(
    `Seasons: ${details.number_of_seasons ?? regularSeasonCount}  Episodes: ${details.number_of_episodes ?? "—"}`,
  );
  console.log(`First air: ${details.first_air_date ?? "—"}`);
  console.log(`Last air: ${details.last_air_date ?? "—"}`);
  console.log(`Language: ${details.original_language ?? "—"}`);
  console.log(`Countries: ${countries}`);
  console.log(`Genres: ${genres}`);
  if (details.tagline) console.log(`Tagline: ${details.tagline}`);
  if (details.overview) {
    console.log("Overview:");
    for (const line of wrapText(details.overview, 92)) {
      console.log(`  ${line}`);
    }
  }
  console.log(`Credits: ${credits}`);
  console.log(`Companies: ${companies}`);
  console.log(
    `In watchlist: ${details.is_present_in_watchlist ? "yes" : "no"}`,
  );
  console.log(`Poster: ${poster ?? "(none)"}`);
}

function toSeriesInsertPayload(details: SeriesDetails): TmdbSeries {
  const ratings = details.content_ratings;

  return {
    ...details,
    name: details.name ?? undefined,
    overview: details.overview ?? undefined,
    tagline: details.tagline ?? undefined,
    status: details.status ?? undefined,
    content_ratings:
      ratings && !("results" in ratings) && "rating" in ratings
        ? { results: [ratings] }
        : undefined,
  };
}

function regularSeasons(seasons: Season[]) {
  return seasons
    .filter((season) => season.seasonNumber > 0)
    .sort((a, b) => a.seasonNumber - b.seasonNumber);
}

async function applyImportedProgress(
  tmdbId: number,
  userId: number,
  row: string[],
  watchStatus: number,
) {
  if (watchStatus === PLAN_TO_WATCH_STATUS) return;

  const { userSeries, userSeasons } = await findUserSeriesAndSeasons(
    tmdbId,
    userId,
  );
  if (!userSeries) {
    throw new Error("series row missing after insert");
  }

  const now = nowUnixSeconds();
  const lastWatchedAt = parseUnixSeconds(cell(row, "Last Watched Date"));
  const countable = regularSeasons(userSeasons);

  if (watchStatus === COMPLETED_STATUS) {
    const completedAt = parseUnixSeconds(
      cell(row, "Completed Date"),
      lastWatchedAt,
    );
    const seasonUpdates = countable.map((season) => ({
      seasonId: season.id,
      values: {
        episodesWatched: season.episodeCount,
        completedAt: lastWatchedAt,
        lastWatchedAt,
        updatedAt: now,
      },
    }));

    await applySeriesWatchUpdates({
      seriesId: userSeries.id,
      seriesValues: {
        watchStatus,
        completedAt,
        lastWatchedAt,
        totalNumberOfEpisodesWatched: countable.reduce(
          (sum, season) => sum + season.episodeCount,
          0,
        ),
        totalNumberOfSeasonsWatched: countable.filter(
          (season) => season.episodeCount > 0,
        ).length,
        updatedAt: now,
      },
      seasonUpdates,
    });
    return;
  }

  let remaining = parseEpisodesWatched(cell(row, "No of Episodes Watched"));
  const seasonUpdates: Array<{
    seasonId: number;
    values: {
      episodesWatched: number;
      lastWatchedAt: string;
      completedAt: string | null;
      updatedAt: string;
    };
  }> = [];

  for (const season of countable) {
    if (remaining <= 0) break;
    if (season.episodeCount <= 0) continue;

    const watched = Math.min(remaining, season.episodeCount);
    remaining -= watched;
    const fullyWatched = watched === season.episodeCount;

    seasonUpdates.push({
      seasonId: season.id,
      values: {
        episodesWatched: watched,
        lastWatchedAt,
        completedAt: fullyWatched ? lastWatchedAt : null,
        updatedAt: now,
      },
    });
  }

  const episodesWatched = seasonUpdates.reduce(
    (sum, update) => sum + update.values.episodesWatched,
    0,
  );
  const seasonsWatched = seasonUpdates.filter(
    (update) => update.values.completedAt !== null,
  ).length;

  await applySeriesWatchUpdates({
    seriesId: userSeries.id,
    seriesValues: {
      watchStatus,
      completedAt: null,
      lastWatchedAt,
      totalNumberOfEpisodesWatched: episodesWatched,
      totalNumberOfSeasonsWatched: seasonsWatched,
      updatedAt: now,
    },
    seasonUpdates,
  });
}

async function importSelectedSeries(
  details: SeriesDetails,
  row: string[],
  userId: number,
) {
  const tmdbId = details.id;
  if (tmdbId === undefined) {
    throw new Error("Selected title is missing a TMDB id");
  }

  if (details.is_present_in_watchlist) {
    throw new Error("already in library");
  }

  const watchStatus = watchStatusForRow(row);
  if (watchStatus === null) {
    throw new Error("unsupported csv status");
  }

  await insertUserSeries(tmdbId, userId, toSeriesInsertPayload(details));
  await applyImportedProgress(tmdbId, userId, row, watchStatus);
}

async function reviewAndImportRow(
  rl: Interface,
  row: string[],
  rowIndex: number,
  userId: number,
  progressLabel: string,
) {
  const title = cell(row, "Title");
  const csvYear = cell(row, "Release Year");

  printDivider();
  console.log(`${progressLabel}  ${title}`);
  console.log(`  CSV status : ${cell(row, "Auto Status") || "—"}`);
  console.log(`  CSV year   : ${csvYear || "—"}`);
  console.log(`  Completed  : ${cell(row, "Completed Date") || "—"}`);
  console.log(`  Last watched: ${cell(row, "Last Watched Date") || "—"}`);
  console.log(
    `  Episodes watched: ${cell(row, "No of Episodes Watched") || "—"}`,
  );
  printDivider();

  if (!title) {
    setImported(rowIndex, `${REJECTED_PREFIX}:missing title`);
    return;
  }

  const { results } = await searchTitles(title, "tv", userId);
  const topResults = pickSearchResults(results, csvYear);

  if (topResults.length === 0) {
    console.log("No TMDB results.\n");
    setImported(rowIndex, `${REJECTED_PREFIX}:no TMDB results`);
    return;
  }

  const exactMatches = findExactNameAndYearMatches(results, title, csvYear);
  if (exactMatches.length === 1) {
    const selected = exactMatches[0];
    console.log(
      `Exact name and year match: ${selected.title} (${selected.release_date ?? "—"}). Importing without confirmation.`,
    );
    try {
      const details = await getSeriesDetails(selected.id as number, userId);
      await importSelectedSeries(details, row, userId);
      setImported(rowIndex, IMPORTED);
      console.log("Imported.\n");
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        setImported(rowIndex, `${REJECTED_PREFIX}:already in library`);
        return;
      }
      const message =
        error instanceof Error ? error.message : "import failed";
      setImported(rowIndex, `${REJECTED_PREFIX}:${message}`);
    }
    return;
  }

  while (!shuttingDown) {
    for (const [index, result] of topResults.entries()) {
      printSearchResult(index + 1, result, csvYear);
    }

    const maxChoice = topResults.length;
    const choice = (
      await promptLine(
        rl,
        `\nChoose 1-${maxChoice} to review, s to skip, q to quit: `,
      )
    ).toLowerCase();

    if (choice === "s") {
      setImported(rowIndex, `${REJECTED_PREFIX}:skipped`);
      return;
    }

    const selectedIndex = Number(choice);
    if (
      !Number.isInteger(selectedIndex) ||
      selectedIndex < 1 ||
      selectedIndex > topResults.length
    ) {
      console.log(`Enter 1-${maxChoice}, s, or q.\n`);
      continue;
    }

    const selected = topResults[selectedIndex - 1];
    const details = await getSeriesDetails(selected.id as number, userId);
    printSeriesDetails(details);

    const confirm = (
      await promptLine(rl, "\nImport this title? y to import, n to go back: ")
    ).toLowerCase();

    if (confirm !== "y" && confirm !== "yes") {
      console.log("Back to search results.\n");
      continue;
    }

    try {
      await importSelectedSeries(details, row, userId);
      setImported(rowIndex, IMPORTED);
      console.log("Imported.\n");
      return;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        setImported(rowIndex, `${REJECTED_PREFIX}:already in library`);
        return;
      }
      const message =
        error instanceof Error ? error.message : "import failed";
      setImported(rowIndex, `${REJECTED_PREFIX}:${message}`);
      return;
    }
  }

  throw new QuitImport();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  csvPath = isAbsolute(args.csv) ? args.csv : resolve(process.cwd(), args.csv);

  const user = await findUserById(args.userId);
  if (!user) {
    throw new Error(`No user found with id ${args.userId}`);
  }

  table = readCsvFile(csvPath);
  if (table.length === 0) {
    throw new Error("CSV file is empty");
  }

  const [header, ...body] = table;
  resolveColumns(header);
  table = [header, ...body.map((row) => [...row])];

  const dataRows = table.slice(1);
  const alreadyImported = dataRows.filter(
    (row) => importedValue(row) === IMPORTED,
  ).length;
  const alreadyIgnored = dataRows.filter(
    (row) => importedValue(row) === IGNORED,
  ).length;
  const toProcess = dataRows.filter(
    (row) =>
      !isFinished(row) && !isDropped(row) && watchStatusForRow(row) !== null,
  ).length;

  console.log(`User: ${user.username} (id ${user.id})`);
  console.log(`CSV: ${csvPath}`);
  console.log(`Rows: ${dataRows.length}`);
  console.log(`Already imported: ${alreadyImported}`);
  console.log(`Already ignored: ${alreadyIgnored}`);
  console.log(`To process: ${toProcess}`);
  console.log("");

  const rl = createInterface({ input, output });
  let processed = 0;

  const handleSignal = () => {
    shuttingDown = true;
    rl.close();
  };

  process.on("SIGINT", handleSignal);
  process.on("SIGTERM", handleSignal);

  try {
    for (let index = 0; index < dataRows.length; index += 1) {
      if (shuttingDown) break;

      const rowIndex = index + 1;
      const row = table[rowIndex];

      if (isFinished(row)) continue;

      if (isDropped(row)) {
        setImported(rowIndex, IGNORED);
        continue;
      }

      if (watchStatusForRow(row) === null) {
        setImported(rowIndex, `${REJECTED_PREFIX}:unsupported status`);
        continue;
      }

      processed += 1;
      try {
        await reviewAndImportRow(
          rl,
          row,
          rowIndex,
          user.id,
          `[${processed}/${toProcess}]`,
        );
      } catch (error) {
        if (error instanceof QuitImport) throw error;
        const message =
          error instanceof Error ? error.message : "import failed";
        setImported(rowIndex, `${REJECTED_PREFIX}:${message}`);
      }
    }
  } catch (error) {
    if (!(error instanceof QuitImport)) throw error;
    console.log("\nStopped. Progress is saved in the CSV.");
  } finally {
    process.off("SIGINT", handleSignal);
    process.off("SIGTERM", handleSignal);
    rl.close();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
