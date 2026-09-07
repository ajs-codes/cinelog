"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SearchGroup } from "@/components/ui/search-group";
import { FloatingSearchButton } from "@/components/search-popup/floating-search-button";

export function GlobalSearchDialog() {
  const [query, setQuery] = useState("");

  return (
    <Dialog>
      <DialogTrigger render={<FloatingSearchButton />} />
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] border border-outline-alt bg-surface-container text-on-surface shadow-[0_8px_24px_rgb(0_0_0/25%)] sm:max-w-3xl"
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
      </DialogContent>
    </Dialog>
  );
}
