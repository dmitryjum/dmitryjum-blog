import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import { CMS_NAME } from "@/lib/constants";
import markdownToHtml from "@/lib/markdownToHtml";

// import { PostBody } from "@/app/_components/post-body";
// import { PostHeader } from "@/app/_components/post-header";
import DateFormatter from "@/app/_components/date-formatter";
import markdownStyles from "@/app/_components/markdown-styles.module.css";
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
        { href: "/blog", label: "Blog" },
      ]}
    >

      <div id="main">

        <section id="content" className="main">
          <span className="image main"><img src={post.coverImage} alt="" /></span>
          <div className="max-w-2xl mx-auto">
            <p><DateFormatter dateString={post.date} /></p>
            <div
              className={markdownStyles["markdown"]}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
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

  const title = `${post.title} | Next.js Blog Example with ${CMS_NAME}`;

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
