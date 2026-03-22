"use client";

import { Search } from "lucide-react";
import { KeyboardEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TagLink } from "@/app/_components/tag-link";

const MOBILE_TAG_COLLAPSE_AT = 8;
const DESKTOP_TAG_COLLAPSE_AT = 28;
const TWO_ROW_TAG_HEIGHT = 100;

type Props = {
  searchQuery?: string;
  selectedTag?: string;
  tags: string[];
  totalPosts: number;
};

export function BlogFilters({ searchQuery, selectedTag, tags, totalPosts }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchQuery ?? "");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const resultsLabel = [
    `${totalPosts} article${totalPosts === 1 ? "" : "s"}`,
    selectedTag ? `in ${selectedTag}` : "",
    searchQuery ? `matching "${searchQuery}"` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const isCollapsible = isDesktop
    ? tags.length >= DESKTOP_TAG_COLLAPSE_AT
    : tags.length >= MOBILE_TAG_COLLAPSE_AT;

  useEffect(() => {
    setQuery(searchQuery ?? "");
  }, [searchQuery]);

  useEffect(() => {
    setIsExpanded(false);
  }, [searchQuery, selectedTag, tags]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const syncViewport = () => {
      setIsDesktop(mediaQuery.matches);
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  function navigate(nextTag?: string, nextQuery?: string) {
    const href = buildBlogHref(1, nextTag, nextQuery);
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(selectedTag, query.trim() || undefined);
  }

  return (
    <section className="px-4 pb-1 pt-8 md:px-8 md:pt-10">
      <form onSubmit={handleSubmit} className="mb-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <div className="mx-auto flex w-full max-w-xl items-stretch gap-2 md:mx-0 md:flex-1">
            <label className="relative block h-11 min-w-0 flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">
                <Search size={18} strokeWidth={2} />
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by project, company, tool, or topic"
                className="h-full w-full rounded-full border border-white/10 bg-slate-950/70 pl-11 pr-4 text-base text-white placeholder:text-slate-500 focus:border-fuchsia-300/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/20"
              />
            </label>
            <div className="flex h-11 shrink-0 items-stretch gap-2">
              <PillAction
                label={isPending ? "Searching" : "Search"}
                onActivate={() => navigate(selectedTag, query.trim() || undefined)}
                active={Boolean(query.trim())}
                tone="search"
                disabled={isPending}
              />
              {(selectedTag || searchQuery) && (
                <PillAction
                  label="Clear"
                  onActivate={() => {
                    setQuery("");
                    navigate(undefined, undefined);
                  }}
                  tone="clear"
                  disabled={isPending}
                />
              )}
            </div>
          </div>
          <span className="text-center text-sm text-slate-400 md:ml-auto md:whitespace-nowrap md:text-right">
            {resultsLabel}
          </span>
        </div>
      </form>

      <div className="border-b border-white/10 pb-3">
        <div
          className="flex flex-wrap justify-center gap-3 overflow-hidden md:justify-start"
          style={isCollapsible && !isExpanded ? { maxHeight: `${TWO_ROW_TAG_HEIGHT}px` } : undefined}
        >
          <TagLink href={buildBlogHref(1)} label="All" active={!selectedTag} />
          {tags.map((tag) => (
            <TagLink
              key={tag}
              href={buildBlogHref(1, tag)}
              label={tag}
              active={tag === selectedTag}
            />
          ))}
        </div>

        {isCollapsible ? (
          <div className="flex justify-center pt-3">
            <span
              tabIndex={0}
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded((current) => !current)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setIsExpanded((current) => !current);
                }
              }}
              className="cursor-pointer text-sm font-medium text-slate-200 underline underline-offset-4 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {isExpanded ? "See fewer tags" : "See more tags"}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

type PillActionProps = {
  label: string;
  onActivate: () => void;
  active?: boolean;
  tone: "search" | "clear";
  disabled?: boolean;
};

function PillAction({ label, onActivate, active = false, tone, disabled = false }: PillActionProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (disabled) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate();
    }
  }

  return (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onActivate}
      onKeyDown={handleKeyDown}
      className={[
        "inline-flex h-full cursor-pointer items-center self-stretch rounded-full border px-4 py-2 text-sm font-medium leading-none transition-[border-color,background-color,color,transform,box-shadow,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        disabled ? "pointer-events-none opacity-60" : "hover:-translate-y-px",
        tone === "search"
          ? active
            ? "border-emerald-300/60 bg-emerald-900 text-emerald-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_24px_rgba(5,150,105,0.22)]"
            : "border-emerald-300/60 bg-emerald-900 text-emerald-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_rgba(5,150,105,0.16)] hover:border-emerald-200/70 hover:bg-emerald-800"
          : "border-rose-300/35 bg-rose-950/80 text-rose-50 hover:border-rose-200/50 hover:bg-rose-900",
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function buildBlogHref(page: number, tag?: string, query?: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (tag) {
    params.set("tag", tag);
  }
  if (query) {
    params.set("q", query);
  }

  return `/blog?${params.toString()}`;
}
