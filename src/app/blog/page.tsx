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
  if (page > totalPages || page < 1) {
    redirect('/blog/?page=1');
  }
  const allPosts = getAllPosts(page, limit);

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
          {allPosts.length > 0 && <MoreStories posts={allPosts} />}
          <div className="flex justify-center">
            <div>
              {page > 1 && <a href={`/blog/?page=${page - 1}`} className="button tiny mx-1 mb-8">&#8592;</a> }
              {pageLinks.length > 1 && pageLinks.map((pageLink, index) => (
                typeof pageLink === 'number' ? (
                  <a
                    key={index}
                    href={`/blog/?page=${pageLink}`}
                    className={`button tiny mx-1 ${pageLink === page ? 'primary' : ''}`}
                  >
                    {pageLink}
                  </a>
                ) : (
                  <span key={index} className="ellipsis">...</span>
                )
              ))}
              {page < totalPages && <a href={`/blog/?page=${page + 1}`} className="button mx-1 tiny mb-8">&#8594;</a> }
            </div>
          </div>
        </Container>
      </div>
    </LayoutUpdater>
  );
}
