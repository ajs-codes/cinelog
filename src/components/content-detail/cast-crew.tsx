"use client";

import { useEffect, useMemo, useRef } from "react";
import { User } from "lucide-react";
import Image from "next/image";

import type { CreditMember } from "@/lib/types";

type CreatedByEntry = {
  id?: number;
  name?: string;
  profile_path?: string | null;
};

type CastCrewProps = {
  credits?: CreditMember[];
  createdBy?: CreatedByEntry[];
};

export function CastCrew({ credits, createdBy }: CastCrewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const mergedCredits = useMemo(() => {
    const base = credits ?? [];
    if (!createdBy || createdBy.length === 0) return base;

    const creatorMembers: CreditMember[] = createdBy.map((creator) => ({
      id: creator.id,
      name: creator.name,
      profile_path: creator.profile_path,
      known_for_department: "Creator",
      job: "Creator",
    }));

    const creatorIds = new Set(creatorMembers.map((c) => c.id));
    const filtered = base.filter((m) => !creatorIds.has(m.id));

    return [...creatorMembers, ...filtered];
  }, [credits, createdBy]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function handleWheel(e: WheelEvent) {
      if (!el || e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    }

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  if (mergedCredits.length === 0) return null;

  return (
    <section className="m-2.5 sm:m-4 rounded-xl sm:rounded-[22px] border border-outline-variant bg-surface-container p-3.5 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold font-noto-sans text-on-surface">
          Cast & Key Crew
        </h2>
      </div>

      <div
        ref={scrollRef}
        className="custom-scrollbar -mx-1 flex gap-2.5 sm:gap-3 overflow-x-auto px-1 pb-2 overscroll-contain"
      >
        {mergedCredits.map((member) => (
          <CreditCard
            key={`${member.id}-${member.character ?? member.job}`}
            member={member}
          />
        ))}
      </div>
    </section>
  );
}

function CreditCard({ member }: { member: CreditMember }) {
  const isCast = member.character != null;
  const roleLabel = isCast
    ? member.character
    : (member.job ?? member.known_for_department ?? "Crew");

  return (
    <div className="flex w-24 sm:w-30 shrink-0 flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high">
      <div className="relative aspect-2/3 w-full bg-surface-container">
        {member.profile_path ? (
          <Image
            alt={member.name ?? "Cast member"}
            className="object-cover"
            fill
            sizes="120px"
            src={`https://image.tmdb.org/t/p/w200${member.profile_path}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-8 w-8 text-outline-muted" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5 px-2.5 py-1.25">
        <span className="truncate text-xs font-medium text-on-surface">
          {member.name ?? "Unknown"}
        </span>
        <span
          className={`truncate text-[11px] ${
            isCast ? "text-brand-tertiary-accent-alt" : "text-outline-muted"
          }`}
        >
          {roleLabel}
        </span>
      </div>
    </div>
  );
}

export default CastCrew;
