import CoverImage from "@/app/_components/cover-image";
import { type Author } from "@/interfaces/author";
import Link from "next/link";
import DateFormatter from "./date-formatter";

type Props = {
  title: string;
  coverImage?: string;
  date: string;
  excerpt: string;
  slug: string;
};

export function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  slug,
}: Props) {
  return (
    <section className="border border-solid border-white py-5 px-6 rounded-lg  mb-8 md:mb-10">
      <Link href={`blog/posts/${slug}`}>
        {coverImage && <div className="mb-8 md:mb-16">
          <CoverImage title={title} src={coverImage} slug={slug} />
        </div> }
        <div className="md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8">
          <div>
            <h3 className="mb-4 text-4xl lg:text-5xl leading-tight">
                {title}
            </h3>
            <div className="mb-4 md:mb-0 text-lg">
              <DateFormatter dateString={date} />
            </div>
          </div>
          <div className="flex align-center">
            <p className="text-lg leading-relaxed mb-4">{excerpt}</p>
          </div>
        </div>
      </Link>
    </section>
  );
}
