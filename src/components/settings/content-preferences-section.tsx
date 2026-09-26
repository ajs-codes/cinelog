"use client";

import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { StepMediaLean } from "@/components/onboarding/steps/step-media-lean";
import { StepGenres } from "@/components/onboarding/steps/step-genres";
import { StepLanguages } from "@/components/onboarding/steps/step-languages";
import { StepEraRating } from "@/components/onboarding/steps/step-era-rating";
import { useContentPreferences } from "@/hooks/settings/use-content-preferences";

export function ContentPreferencesSection() {
  const { draft, actions, isLoading, isSaving, message, save } =
    useContentPreferences();

  if (isLoading) {
    return (
      <p className="font-public-sans text-sm text-secondary">
        Loading your preferences…
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {message ? (
        <AlertBanner
          message={message.text}
          variant={message.type === "success" ? "success" : "error"}
        />
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="font-public-sans text-sm font-semibold text-on-surface">
          What do you watch
        </h2>
        <StepMediaLean value={draft.mediaLean} chosen onSelect={actions.setMediaLean} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-public-sans text-sm font-semibold text-on-surface">
          Genres
        </h2>
        <StepGenres selected={draft.genreIds} onToggle={actions.toggleGenre} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-public-sans text-sm font-semibold text-on-surface">
          Languages
        </h2>
        <StepLanguages
          selected={draft.languages}
          onToggle={actions.toggleLanguage}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-public-sans text-sm font-semibold text-on-surface">
          Era & Rating
        </h2>
        <StepEraRating
          eras={draft.eras}
          minRating={draft.minRating}
          onToggleEra={actions.toggleEra}
          onSetRating={actions.setMinRating}
        />
      </section>

      <div>
        <Button
          onClick={save}
          disabled={
            isSaving || draft.genreIds.length < 1 || draft.languages.length < 1
          }
        >
          {isSaving ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </div>
  );
}
