"use client";

import { Search, X, Clapperboard } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MovieList } from "@/components/search-popup/movie-list";
import { SearchGroup } from "@/components/ui/search-group";
import { FloatingSearchButton } from "@/components/search-popup/floating-search-button";

export function SearchDialog() {
  const [query, setQuery] = useState("");
  const [mediaType, setMediaType] = useState<"movies" | "series">("movies");

  return (
    <Dialog>
      <DialogTrigger render={<FloatingSearchButton />} />
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] border border-outline-alt bg-surface-container shadow-[0_8px_24px_rgb(0_0_0/25%)] sm:max-w-3xl"
        showCloseButton={false}
      >
        <SearchGroup
          endIcon={<X className="size-4" />}
          onClear={() => setQuery("")}
          onValueChange={setQuery}
          placeholder="Search movies and series"
          showClearButton
          startIcon={<Search className="size-5" />}
          value={query}
        />

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center rounded-xl border border-[#232527] bg-[#101112] p-1 gap-1">
            <Button
              className="rounded-lg px-3.5 py-1.5"
              onClick={() => setMediaType("movies")}
              size="default"
              variant={mediaType === "movies" ? "primaryFilled" : "darkFilled"}
              type="button"
            >
              <Clapperboard className="size-3.5" />
              Movies
            </Button>
            <Button
              className="rounded-lg px-3.5 py-1.5 text-text-secondary no-underline"
              onClick={() => setMediaType("series")}
              size="default"
              variant={mediaType === "series" ? "primaryFilled" : "darkFilled"}
              type="button"
            >
              Series &amp; Anime
            </Button>
          </div>

          <Badge
            className="border-[#262626] bg-[#161718] px-3.25 py-1.75 text-on-surface"
            indicator="success"
            text="5 results"
          />
        </div>

        <MovieList
          genre="Sci-Fi, Adventure"
          originalLanguage="English"
          poster="https://image.tmdb.org/t/p/w200/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg"
          rating="8.8"
          synopsis="Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the universe."
          title="Dune: Part Two"
          year="2024"
        />
      </DialogContent>
    </Dialog>
  );
}
