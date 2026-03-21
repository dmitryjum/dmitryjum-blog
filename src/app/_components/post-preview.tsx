"use client";

import { useEffect, useRef, useState } from "react";
import { type Author } from "@/interfaces/author";
import Link from "next/link";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";
import { TagLink } from "./tag-link";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  author?: Author;
  slug: string;
  tags?: string[];
};

export function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  slug,
  tags = [],
}: Props) {
  const [isExcerptExpanded, setIsExcerptExpanded] = useState(false);
  const [isExcerptOverflowing, setIsExcerptOverflowing] = useState(false);
  const excerptRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = excerptRef.current;
    if (!element) {
      return;
    }

    const measureOverflow = () => {
      const computedStyle = window.getComputedStyle(element);
      const lineHeight = parseFloat(computedStyle.lineHeight);

      if (!lineHeight) {
        setIsExcerptOverflowing(false);
        return;
      }

      const maxHeight = lineHeight * 2;
      setIsExcerptOverflowing(element.scrollHeight - 1 > maxHeight);
    };

    measureOverflow();

    const resizeObserver = new ResizeObserver(measureOverflow);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [excerpt]);

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/50 px-5 py-5 shadow-[0_18px_50px_rgba(2,6,23,0.28)] backdrop-blur-sm sm:px-6">
      {coverImage && <div className="mb-5">
        <CoverImage slug={slug} title={title} src={coverImage} />
      </div> }
      <h3 className="text-xl mb-1 leading-snug">
        <Link href={`/blog/posts/${slug}`}>
          {title}
        </Link>
      </h3>
      <div className="mb-3 text-base text-slate-400">
        <DateFormatter dateString={date} />
      </div>
      {tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagLink
              key={tag}
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              label={tag}
            />
          ))}
        </div>
      )}
      <div className="relative">
        <p
          ref={excerptRef}
          className={[
            "mb-1 text-base leading-relaxed text-slate-100/90",
            isExcerptExpanded ? "" : "line-clamp-2",
            isExcerptOverflowing && !isExcerptExpanded ? "pr-14" : "",
          ].join(" ")}
        >
          {excerpt}
        </p>
        {isExcerptOverflowing && !isExcerptExpanded && (
          <a
            href={`/blog/posts/${slug}#excerpt-toggle`}
            onClick={(event) => {
              event.preventDefault();
              setIsExcerptExpanded(true);
            }}
            className="absolute bottom-0 right-1 text-base leading-relaxed text-slate-100/90 underline decoration-white/40 underline-offset-2 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            see more
          </a>
        )}
        {isExcerptOverflowing && isExcerptExpanded && (
          <a
            href={`/blog/posts/${slug}#excerpt-toggle`}
            onClick={(event) => {
              event.preventDefault();
              setIsExcerptExpanded(false);
            }}
            className="inline-block text-base leading-none text-slate-100/90 underline decoration-white/40 underline-offset-2 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            show less
          </a>
        )}
      </div>
    </article>
  );
}
