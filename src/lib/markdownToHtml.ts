import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { codeToHtml } from "shiki";

type MarkdownNode = {
  type?: string;
  lang?: string | null;
  value?: string;
  children?: MarkdownNode[];
};

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(remarkCodeBlocksToShikiHtml)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return result.toString();
}

function remarkCodeBlocksToShikiHtml() {
  return async function transform(tree: MarkdownNode) {
    await visitAndHighlight(tree);
  };
}

async function visitAndHighlight(node: MarkdownNode) {
  if (node.type === "code") {
    const language = node.lang || "text";

    try {
      node.type = "html";
      node.value = await codeToHtml(node.value || "", {
        lang: language,
        theme: "monokai",
      });
    } catch {
      node.type = "html";
      node.value = await codeToHtml(node.value || "", {
        lang: "text",
        theme: "monokai",
      });
    }

    delete node.lang;
    delete node.children;
    return;
  }

  if (!node.children) {
    return;
  }

  for (const child of node.children) {
    await visitAndHighlight(child);
  }
}
