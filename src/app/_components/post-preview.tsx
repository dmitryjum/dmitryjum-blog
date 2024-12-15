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
    <div className="border border-white p-5 px-6 bg-opacity-60 bg-gray-800 rounded-lg">
      {coverImage && <div className="mb-5">
        <CoverImage slug={slug} title={title} src={coverImage} />
      </div> }
      <h3 className="text-3xl mb-3 leading-snug">
        <Link href={`/blog/posts/${slug}`}>
          {title}
        </Link>
      </h3>
      <div className="text-lg mb-4 text-gray-500">
        <DateFormatter dateString={date} />
      </div>
      <p className="text-lg leading-relaxed mb-4">{excerpt}</p>
    </div>
  );
}
