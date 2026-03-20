import { Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "_posts");

function normalizePost(post: Post): Post {
  return {
    ...post,
    tags: Array.isArray(post.tags) ? post.tags : [],
  };
}

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return normalizePost({ ...data, slug: realSlug, content } as Post);
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  return slugs
    .map((slug) => getPostBySlug(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
}

export function getFilteredPosts(tag?: string, query?: string): Post[] {
  return getAllPosts().filter((post) => matchesFilters(post, tag, query));
}

export function getPaginatedPosts(page: number = 1, limit: number = 5, tag?: string, query?: string): Post[] {
  const posts = getFilteredPosts(tag, query);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return posts.slice(startIndex, endIndex);
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((post) => post.tags?.includes(tag));
}

export function getAllTags(): string[] {
  return Array.from(
    new Set(
      getAllPosts().flatMap((post) => post.tags ?? []),
    ),
  ).sort((tagA, tagB) => tagA.localeCompare(tagB));
}

function matchesFilters(post: Post, tag?: string, query?: string) {
  if (tag && !post.tags?.includes(tag)) {
    return false;
  }

  if (!query) {
    return true;
  }

  const searchTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (searchTerms.length === 0) {
    return true;
  }

  const searchableText = [
    post.title,
    post.excerpt,
    post.slug.replace(/-/g, " "),
    post.tags?.join(" "),
    post.content,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchTerms.every((term) => searchableText.includes(term));
}
