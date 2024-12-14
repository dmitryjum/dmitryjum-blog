import Container from "@/app/_components/container";
import { MoreStories } from "@/app/_components/more-stories";
import { getAllPosts } from "@/lib/api";
import { LayoutUpdater } from "@/app/_components/LayoutUpdater";

export default function Index() {
  const allPosts = getAllPosts();

  return (
    <LayoutUpdater
      headerTitle='Dmitry Jum'
      headerSubtitle='Software Engineer | Web Developer'
      navLinks={[
        { href: "/", label: "Home" },
        { href: '#footer', label: 'Contact me' },
        { href: "/blog", label: "Blog", className: "active" },
      ]}
    >
      <div id="main">
        <Container>
          {allPosts.length > 0 && <MoreStories posts={allPosts} />}
        </Container>
      </div>
    </LayoutUpdater>
  );
}
