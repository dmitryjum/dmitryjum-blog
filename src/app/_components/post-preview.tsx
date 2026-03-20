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
      <p className="mb-4 text-base leading-relaxed text-slate-100/90 line-clamp-3">{excerpt}</p>
    </article>
  );
}
