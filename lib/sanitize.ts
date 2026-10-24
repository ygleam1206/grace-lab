import sanitizeHtml from "sanitize-html";

const COLOR_RE = /^#[0-9a-f]{3,8}$/i;
const RGB_RE = /^rgba?\([\d\s.,%]+\)$/i;
const COLOR_NAME_RE = /^[a-z]+$/i;
const FONT_SIZE_RE = /^\d+(\.\d+)?(px|pt|em|rem|%)$/i;

/**
 * 清理笔记富文本内容（保存时在服务端执行）。
 * 只放行排版相关标签与内联样式（字号 / 文字色 / 背景色），
 * 剔除脚本、事件属性、iframe、危险 URL，保证公开静态站渲染安全。
 */
export function sanitizeNoteContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "h1", "h2", "h3", "h4", "h5", "h6",
      "strong", "b", "em", "i", "u", "s", "strike", "del",
      "blockquote", "ul", "ol", "li",
      "a", "img", "code", "pre", "hr",
      "span", "mark",
      "table", "thead", "tbody", "tr", "th", "td",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
      span: ["style"],
      mark: ["style", "data-color"],
      p: ["style"],
      h1: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      h5: ["style"],
      h6: ["style"],
      pre: ["class"],
      code: ["class"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedStyles: {
      span: {
        color: [COLOR_RE, RGB_RE, COLOR_NAME_RE],
        "background-color": [COLOR_RE, RGB_RE, COLOR_NAME_RE],
        "font-size": [FONT_SIZE_RE],
      },
      mark: {
        color: [COLOR_RE, RGB_RE, COLOR_NAME_RE],
        "background-color": [COLOR_RE, RGB_RE, COLOR_NAME_RE],
      },
      // 段落 / 标题上用内联样式记录的字号（Word、备忘录粘贴常见）
      p: { "font-size": [FONT_SIZE_RE] },
      h1: { "font-size": [FONT_SIZE_RE] },
      h2: { "font-size": [FONT_SIZE_RE] },
      h3: { "font-size": [FONT_SIZE_RE] },
      h4: { "font-size": [FONT_SIZE_RE] },
      h5: { "font-size": [FONT_SIZE_RE] },
      h6: { "font-size": [FONT_SIZE_RE] },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    transformTags: {
      a: (tagName, attribs) => {
        const href = (attribs.href || "").trim();
        // 危险协议（javascript: 等）直接把链接降级为普通文本，避免留下失效空链接
        if (/^\s*(javascript|vbscript|data):/i.test(href)) {
          return { tagName: "span", attribs: {} };
        }
        const isExternal = /^https?:\/\//i.test(href);
        return {
          tagName,
          attribs: {
            href,
            ...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {}),
          },
        };
      },
    },
  });
}
