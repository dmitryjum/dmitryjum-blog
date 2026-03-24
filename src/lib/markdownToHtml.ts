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

type HtmlNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, string>;
  children?: HtmlNode[];
};

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(remarkCodeBlocksToShikiHtml)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypePrioritizeLeadImage)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return result.toString();
}

function remarkCodeBlocksToShikiHtml() {
  return async function transform(tree: MarkdownNode) {
    await visitAndHighlight(tree);
  };
}

function rehypePrioritizeLeadImage() {
  return function transform(tree: HtmlNode) {
    const firstImage = findFirstImage(tree);

    if (!firstImage) {
      return;
    }

    firstImage.properties = {
      ...firstImage.properties,
      loading: "eager",
      fetchpriority: "high",
      decoding: "async",
    };
  };
}

function findFirstImage(node: HtmlNode): HtmlNode | null {
  if (node.type === "element" && node.tagName === "img") {
    return node;
  }

  if (!node.children) {
    return null;
  }

  for (const child of node.children) {
    const imageNode = findFirstImage(child);

    if (imageNode) {
      return imageNode;
    }
  }

  return null;
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
