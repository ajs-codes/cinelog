import type { SagaIterator } from "redux-saga";
import { call, put, select, takeEvery, takeLatest } from "redux-saga/effects";
import {
  detailsFailed,
  detailsRequested,
  detailsSucceeded,
  mutationFailed,
  mutationRequested,
  mutationSucceeded,
  type ContentDetailsData,
  type ContentDetailsState,
  type ContentLibraryFields,
} from "./contentDetailsSlice";
import {
  completionImpressionPrompt,
  impressionPromptFailed,
  impressionPromptRequested,
  impressionPromptResolved,
} from "./impressionPromptSlice";
import {
  libraryWatchlistItemAdded,
  libraryWatchlistItemRemoved,
} from "./librarySlice";
import { showToast } from "./toastSlice";
import { IMPRESSION, WATCH_STATUS } from "@/lib/constants";
import { apiFetch } from "@/lib/http/client";

type DetailsResponse = ContentDetailsData & { error?: string };
type MutationResponse = ContentLibraryFields &
  ContentDetailsData & { error?: string };

function* fetchContentDetails(
  action: ReturnType<typeof detailsRequested>,
): SagaIterator {
  const { id, mediaType } = action.payload;

  try {
    const response: Response = yield call(fetch, `/api/${mediaType}/${id}`, {
      cache: "no-store",
    });
    const data: DetailsResponse = yield call([response, "json"]);

    if (!response.ok) {
      throw new Error(data.error ?? "Content details request failed");
    }

    yield put(detailsSucceeded({ data, id, mediaType }));
  } catch (error) {
    yield put(
      detailsFailed({
        error:
          error instanceof Error
            ? error.message
            : "Content details request failed",
        id,
        mediaType,
      }),
    );
  }
}

const activeMutations = new Set<string>();

function* mutateContentDetails(
  action: ReturnType<typeof mutationRequested>,
): SagaIterator {
  const { id, mediaType, mutation, value, progress } = action.payload;
  const mutationKey = `${mediaType}:${id}:${mutation}`;

  if (activeMutations.has(mutationKey)) {
    return;
  }
  activeMutations.add(mutationKey);

  const method =
    mutation === "add-watchlist"
      ? "POST"
      : mutation === "remove-watchlist"
        ? "DELETE"
        : "PATCH";
  const body =
    mutation === "update-impression"
      ? { impression: value }
      : mutation === "update-watch-status"
        ? { watch_status: value }
        : mutation === "update-progress" && progress
          ? {
              mark_season_to_watched: progress.seasonNumber,
              mark_episode_to_watched: progress.episodeNumber,
            }
          : undefined;

  try {
    if (
      mutation === "update-progress" &&
      (!progress || mediaType !== "series")
    ) {
      throw new Error("Series progress details are unavailable");
    }

    const response: Response = yield call(apiFetch, `/api/${mediaType}/${id}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data: MutationResponse = yield call([response, "json"]);
    if (!response.ok) throw new Error(data.error ?? "Content update failed");

    if (mutation === "add-watchlist") {
      yield put(detailsSucceeded({ data, id, mediaType }));
      yield put(libraryWatchlistItemAdded({ mediaType }));
      yield put(
        showToast({
          message: "Added to your watchlist",
          variant: "success",
        }),
      );
      return;
    }

    if (mutation === "remove-watchlist") {
      const current: ContentDetailsData | null = yield select(
        (state: { contentDetails: ContentDetailsState }) =>
          state.contentDetails[mediaType][id]?.data ?? null,
      );
      const seasons =
        current && "seasons" in current && Array.isArray(current.seasons)
          ? current.seasons.flatMap((season) =>
              season.season_number === undefined
                ? []
                : [{ season_number: season.season_number, episodes_watched: 0 }],
            )
          : undefined;

      yield put(
        mutationSucceeded({
          id,
          mediaType,
          data: {
            is_present_in_watchlist: false,
            watch_status: null,
            impression: null,
            total_number_of_episodes_watched: 0,
            total_number_of_seasons_watched: 0,
            seasons,
          },
        }),
      );
      yield put(
        libraryWatchlistItemRemoved({
          mediaType,
          tmdbId: Number(id),
        }),
      );
      yield put(
        showToast({
          message: "Removed from your watchlist",
          variant: "success",
        }),
      );
      return;
    }

    yield put(mutationSucceeded({ id, mediaType, data }));

    if (mutation === "update-watch-status" || mutation === "update-progress") {
      const current: ContentDetailsData | null = yield select(
        (state: { contentDetails: ContentDetailsState }) =>
          state.contentDetails[mediaType][id]?.data ?? null,
      );
      const title =
        current && "title" in current && current.title
          ? current.title
          : current && "name" in current && current.name
            ? current.name
            : "this title";
      const prompt = completionImpressionPrompt({
        mediaType,
        tmdbId: Number(id),
        title,
        source: "details",
        impression: data.impression,
        requestedWatchStatus:
          mutation === "update-watch-status" && typeof value === "number"
            ? value
            : undefined,
        requestedProgress: progress,
        seasons: data.seasons,
        resultingWatchStatus: data.watch_status,
      });

      if (prompt) {
        yield put(impressionPromptRequested(prompt));
      }
    } else if (mutation === "update-impression") {
      yield put(
        impressionPromptResolved({ mediaType, tmdbId: Number(id) }),
      );
    }

    if (mutation === "update-progress" && progress) {
      const season = data.seasons?.find(
        (s) => s.season_number === progress.seasonNumber,
      );
      const isSeasonCompleted = season
        ? season.episodes_watched >= (season.episode_count ?? 0)
        : false;

      if (isSeasonCompleted) {
        yield put(
          showToast({
            message: `Season ${progress.seasonNumber} completed!`,
            variant: "success",
          }),
        );
      } else {
        yield put(
          showToast({
            message: `Episode ${progress.episodeNumber} marked as completed`,
            variant: "success",
          }),
        );
      }
    } else if (mutation === "update-watch-status") {
      const statusName =
        Object.values(WATCH_STATUS).find((s) => s.value === value)
          ?.display_value ?? "Status";
      yield put(
        showToast({
          message: `Status updated to ${statusName}`,
          variant: "success",
        }),
      );
    } else if (mutation === "update-impression") {
      if (value === null || value === undefined) {
        yield put(
          showToast({
            message: "Impression removed",
            variant: "info",
          }),
        );
      } else {
        const impName =
          Object.values(IMPRESSION).find((i) => i.value === value)
            ?.display_value ?? "Reaction";
        yield put(
          showToast({
            message: `Impression updated to ${impName}`,
            variant: "success",
          }),
        );
      }
    }
  } catch (error) {
    yield put(
      mutationFailed({
        id,
        mediaType,
        error: error instanceof Error ? error.message : "Content update failed",
      }),
    );
    const message =
      error instanceof Error ? error.message : "Content update failed";
    if (mutation === "update-impression") {
      yield put(
        impressionPromptFailed({
          mediaType,
          tmdbId: Number(id),
          error: message,
        }),
      );
    }
    yield put(
      showToast({
        message,
        variant: "error",
      }),
    );
  } finally {
    activeMutations.delete(mutationKey);
  }
}

export function* contentDetailsSaga(): SagaIterator {
  yield takeLatest(detailsRequested.type, fetchContentDetails);
  yield takeEvery(mutationRequested.type, mutateContentDetails);
}
