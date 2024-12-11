import Container from "@/app/_components/container";
import { HeroPost } from "@/app/_components/hero-post";
import { MoreStories } from "@/app/_components/more-stories";
import { getAllPosts } from "@/lib/api";
import { LayoutUpdater } from "@/app/_components/LayoutUpdater";

export default function Index() {
  const allPosts = getAllPosts();

  const heroPost = allPosts[0];

  const morePosts = allPosts.slice(1);

  return (
    <LayoutUpdater
      headerTitle='Dmitry Jum'
      headerSubtitle='Software Engineer | Web Developer'
      navLinks={[
        { href: "/", label: "Home" },
        { href: "/blog", label: "Blog", className: "active" },
      ]}
    >
      <div id="main">
        <Container>
          <HeroPost
            title={heroPost.title}
            coverImage={heroPost.coverImage}
            date={heroPost.date}
            author={heroPost.author}
            slug={heroPost.slug}
            excerpt={heroPost.excerpt}
          />
          {morePosts.length > 0 && <MoreStories posts={morePosts} />}
        </Container>
      </div>
    </LayoutUpdater>
  );
}
