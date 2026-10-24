import { Extension } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    inlineStyles: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
      setBackgroundColor: (color: string) => ReturnType;
      unsetBackgroundColor: () => ReturnType;
    };
  }
}

/**
 * 在 TextStyle 上扩展字号与背景色属性，
 * 用于保留从备忘录 / 网页 / Word 粘贴进来的内联样式。
 */
export const InlineStyles = Extension.create({
  name: "inlineStyles",

  addOptions() {
    return { types: ["textStyle"] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize?.replace(/['"]+/g, "") || null,
            renderHTML: (attributes) =>
              attributes.fontSize
                ? { style: `font-size: ${attributes.fontSize}` }
                : {},
          },
          backgroundColor: {
            default: null,
            parseHTML: (element) =>
              element.style.backgroundColor?.replace(/['"]+/g, "") || null,
            renderHTML: (attributes) =>
              attributes.backgroundColor
                ? { style: `background-color: ${attributes.backgroundColor}` }
                : {},
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
      setBackgroundColor:
        (backgroundColor) =>
        ({ chain }) =>
          chain().setMark("textStyle", { backgroundColor }).run(),
      unsetBackgroundColor:
        () =>
        ({ chain }) =>
          chain()
            .setMark("textStyle", { backgroundColor: null })
            .removeEmptyTextStyle()
            .run(),
    };
  },
});

/**
 * 段落 / 标题上的字号。
 * Word、备忘录会把字号写在块级元素的内联样式上（如 <p style="font-size:11pt">），
 * 只靠 TextStyle 会丢掉这类格式，这里把它们记录到块节点属性上。
 */
export const BlockStyles = Extension.create({
  name: "blockStyles",

  addOptions() {
    return { types: ["paragraph", "heading"] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize?.replace(/['"]+/g, "") || null,
            renderHTML: (attributes) =>
              attributes.fontSize
                ? { style: `font-size: ${attributes.fontSize}` }
                : {},
          },
        },
      },
    ];
  },
});
