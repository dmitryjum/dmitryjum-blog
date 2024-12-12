import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import markdownToHtml from "@/lib/markdownToHtml";

import DateFormatter from "@/app/_components/date-formatter";
import { LayoutUpdater } from "@/app/_components/LayoutUpdater";

export default async function Post(props: Params) {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const content = await markdownToHtml(post.content || "");
  return (
    <LayoutUpdater
      headerTitle={post.title}
      headerSubtitle={post.author.name}
      navLinks={[
        { href: "/", label: "Home" },
        { href: "/blog", label: "Blog", className: "active" },
      ]}
    >

      <div id="main">

        <section id="content" className="main">
          { post.coverImage && <span className="image main"><img src={post.coverImage} alt="" /></span> } 
            <p><DateFormatter dateString={post.date} /></p>
            <div
              dangerouslySetInnerHTML={{ __html: content }}
            />
        </section>

      </div>
       
    </LayoutUpdater>
  );
}

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const title = `${post.title} | Dmitry Jum Software Engineer blog`;

  return {
    title,
    openGraph: {
      title,
      images: [post.ogImage.url],
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
