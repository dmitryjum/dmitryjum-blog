import { type Author } from "@/interfaces/author";
import Link from "next/link";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  author?: Author;
  slug: string;
};

export function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  slug,
}: Props) {
  return (
    <div className="pt-3 px-6 bg-opacity-60 bg-gray-800 rounded-lg">
      {coverImage && <div className="mb-5">
        <CoverImage slug={slug} title={title} src={coverImage} />
      </div> }
      <h3 className="text-xl mb-1 leading-snug">
        <Link href={`/blog/posts/${slug}`}>
          {title}
        </Link>
      </h3>
      <div className="text-base mb-1 text-gray-500">
        <DateFormatter dateString={date} />
      </div>
      <p className="text-base leading-relaxed mb-4 line-clamp-2">{excerpt}</p>
    </div>
  );
}
