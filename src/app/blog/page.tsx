import Container from "@/app/_components/container";
import { HeroPost } from "@/app/_components/hero-post";
// import { Intro } from "@/app/_components/intro";
import { MoreStories } from "@/app/_components/more-stories";
import { getAllPosts } from "@/lib/api";

export default function Index() {
  const allPosts = getAllPosts();

  const heroPost = allPosts[0];

  const morePosts = allPosts.slice(1);

  return (
    // <main>
    <>
      <header id="header" className="alt">
        <span className="logo"><img src="/stellar/images/logo.svg" alt="" /></span>
        <h1>Stellar</h1>
        <p>Just another free, fully responsive site template<br />
          built by <a href="https://twitter.com/ajlkn">@ajlkn</a> for <a href="https://html5up.net">HTML5 UP</a>.</p>
      </header>
      <nav id="nav">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/blog">Blog</a></li>
        </ul>
      </nav>
      <div id="main">
        <Container>
          {/* <Intro /> */}
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
    </>
    /* </main> */
  );
}
