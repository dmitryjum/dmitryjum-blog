"use client";

import { Search } from "lucide-react";
import { KeyboardEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TagLink } from "@/app/_components/tag-link";

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

  useEffect(() => {
    setQuery(searchQuery ?? "");
  }, [searchQuery]);

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
        <div className="mx-auto flex max-w-xl items-stretch gap-2 md:mx-0">
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
      </form>

      <div className="flex flex-wrap items-end justify-center gap-3 border-b border-white/10 pb-3 md:justify-start">
        <TagLink href={buildBlogHref(1)} label="All" active={!selectedTag} />
        {tags.map((tag) => (
          <TagLink
            key={tag}
            href={buildBlogHref(1, tag)}
            label={tag}
            active={tag === selectedTag}
          />
        ))}
        <span className="self-end pb-1 text-center text-sm leading-none text-slate-400 max-sm:w-full max-sm:pt-1 md:ml-auto md:text-right">
          {totalPosts} article{totalPosts === 1 ? "" : "s"}
          {selectedTag ? ` in ${selectedTag}` : ""}
          {searchQuery ? ` matching "${searchQuery}"` : ""}
        </span>
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
