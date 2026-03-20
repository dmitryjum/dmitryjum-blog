import Container from "@/app/_components/container";
import { MoreStories } from "@/app/_components/more-stories";
import { TagLink } from "@/app/_components/tag-link";
import { getAllPosts, getAllTags, getPaginatedPosts, getPostsByTag } from "@/lib/api";
import { LayoutUpdater } from "@/app/_components/LayoutUpdater";
import { redirect } from "next/navigation";

type Params = {
  searchParams: Promise<{
    page?: string;
    tag?: string;
  }>;
};

export default async function Index(props: Params) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || "1", 10);
  const selectedTag = searchParams.tag?.trim() || undefined;
  const limit = 8;
  const tags = getAllTags();
  const filteredPosts = selectedTag ? getPostsByTag(selectedTag) : undefined;
  const totalPosts = filteredPosts?.length ?? getAllPosts().length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / limit));
  if (page > totalPages || page < 1) {
    redirect(buildBlogHref(1, selectedTag));
  }
  const allPosts = getPaginatedPosts(page, limit, selectedTag);

  function generatePageLinks(currentPage: number, totalPages: number) {
    const pageLinks: Array<number | string> = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // If total pages are less than or equal to maxPagesToShow, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageLinks.push(i);
      }
    } else {
      // Always show the first page
      pageLinks.push(1);

      // Determine the range of pages to show around the current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis if there's a gap between the first page and the startPage
      if (startPage > 2) {
        pageLinks.push('...');
      }

      // Add the range of pages around the current page
      for (let i = startPage; i <= endPage; i++) {
        pageLinks.push(i);
      }

      // Add ellipsis if there's a gap between the endPage and the last page
      if (endPage < totalPages - 1) {
        pageLinks.push('...');
      }

      // Always show the last page
      pageLinks.push(totalPages);
    }

    return pageLinks;
  }

  const pageLinks = generatePageLinks(page, totalPages);

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
          <section className="mb-3 pt-2 md:px-8">
            <div className="mb-4 flex flex-col gap-2 border-b border-white/10 pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-cyan-200/65">
                  Filter By Tag
                </p>
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[2rem]">
                  {selectedTag ? selectedTag : "All blog posts"}
                </h1>
              </div>
              <p className="text-sm text-slate-400">
                {totalPosts} article{totalPosts === 1 ? "" : "s"}
                {selectedTag ? ` in ${selectedTag}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <TagLink href="/blog" label="All" active={!selectedTag} />
              {tags.map((tag) => (
                <TagLink
                  key={tag}
                  href={buildBlogHref(1, tag)}
                  label={tag}
                  active={tag === selectedTag}
                />
              ))}
            </div>
          </section>

          {allPosts.length > 0 && <MoreStories posts={allPosts} />}
          {allPosts.length === 0 && (
            <section className="rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/40 px-6 py-10 text-center">
              <p className="text-lg text-white">No posts found for this tag.</p>
              <p className="mt-2 text-sm text-slate-400">
                Try another topic or return to all articles.
              </p>
              <div className="mt-5">
                <TagLink href="/blog" label="Back to all posts" />
              </div>
            </section>
          )}
          <div className="flex justify-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {page > 1 && <a href={buildBlogHref(page - 1, selectedTag)} className="button tiny mb-8">&#8592;</a>}
              {pageLinks.length > 1 && pageLinks.map((pageLink, index) => (
                typeof pageLink === 'number' ? (
                  <a
                    key={index}
                    href={buildBlogHref(pageLink, selectedTag)}
                    className={`button tiny mx-1 ${pageLink === page ? 'primary' : ''}`}
                  >
                    {pageLink}
                  </a>
                ) : (
                  <span key={index} className="ellipsis">...</span>
                )
              ))}
              {page < totalPages && <a href={buildBlogHref(page + 1, selectedTag)} className="button tiny mb-8">&#8594;</a>}
            </div>
          </div>
        </Container>
      </div>
    </LayoutUpdater>
  );
}

function buildBlogHref(page: number, tag?: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (tag) {
    params.set("tag", tag);
  }

  return `/blog?${params.toString()}`;
}
