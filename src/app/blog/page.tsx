import Container from "@/app/_components/container";
import { MoreStories } from "@/app/_components/more-stories";
import { getAllPosts, getPostSlugs } from "@/lib/api";
import { LayoutUpdater } from "@/app/_components/LayoutUpdater";
import { redirect } from "next/navigation";

type Params = {
  searchParams: Promise<{
    page?: string
  }>;
}

export default async function Index(props: Params) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 5;
  const totalPosts = getPostSlugs().length;
  const totalPages = Math.ceil(totalPosts / limit);
  const pageButtonsGap = page > 1 && page < totalPages ? "grid-cols-2" : "grid-cols-1"
  if (page > totalPages || page < 1) {
    redirect('/blog/?page=1');
  }
  const allPosts = getAllPosts(page, limit);

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
          <div className="flex justify-center">
            <div className={`grid ${pageButtonsGap} gap-x-3`}>
              {page > 1 && <a href={`/blog/?page=${page - 1}`} className="button small mb-8">Previous</a> }
              {page < totalPages && <a href={`/blog/?page=${page + 1}`} className="button small mb-8">Next</a> }
            </div>
          </div>
        </Container>
      </div>
    </LayoutUpdater>
  );
}
