import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeShiki from "@shikijs/rehype";
import rehypeStringify from "rehype-stringify";

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(remarkRehype)
    .use(rehypeShiki, {
      theme: "monokai",
      fallbackLanguage: "text",
    })
    .use(rehypeStringify)
    .process(markdown);

  return result.toString();
}
