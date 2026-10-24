"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { InlineStyles, BlockStyles } from "@/lib/tiptap-inline-styles";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Link2,
  Eraser,
  Highlighter,
} from "lucide-react";
import { useRef, useState, useCallback } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const FONT_SIZES = [
  { label: "默认字号", value: "" },
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "28px", value: "28px" },
  { label: "36px", value: "36px" },
];

// 工具栏按钮配置
const toolbarButtons: Array<{
  icon: React.ComponentType<{ size?: number }>;
  action: string;
  title: string;
  active?: string;
  attrs?: Record<string, unknown>;
}> = [
  { icon: Pilcrow, action: "paragraph", title: "正文" },
  { icon: Heading1, action: "heading1", title: "一级标题", active: "heading", attrs: { level: 1 } },
  { icon: Heading2, action: "heading2", title: "二级标题", active: "heading", attrs: { level: 2 } },
  { icon: Heading3, action: "heading3", title: "三级标题", active: "heading", attrs: { level: 3 } },
  { icon: Bold, action: "bold", title: "加粗", active: "bold" },
  { icon: Italic, action: "italic", title: "斜体", active: "italic" },
  { icon: UnderlineIcon, action: "underline", title: "下划线", active: "underline" },
  { icon: Strikethrough, action: "strike", title: "删除线", active: "strike" },
  { icon: List, action: "bulletList", title: "无序列表", active: "bulletList" },
  { icon: ListOrdered, action: "orderedList", title: "有序列表", active: "orderedList" },
  { icon: Quote, action: "blockquote", title: "块引用", active: "blockquote" },
  { icon: Link2, action: "link", title: "插入链接" },
  { icon: Undo, action: "undo", title: "撤销" },
  { icon: Redo, action: "redo", title: "重做" },
];

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    // 工具栏的激活态/字号/颜色依赖每次事务后的重新渲染
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        // StarterKit v3 已内置 Link / Underline，这里只做链接行为配置
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
          },
        },
      }),
      TextStyle,
      InlineStyles,
      BlockStyles,
      Color,
      Highlight.configure({ multicolor: true }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder: "开始写笔记，或直接粘贴富文本内容...",
      }),
    ],
    content: content || "<p></p>",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[400px] px-1 py-2",
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of items) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              uploadImage(file);
            }
            return true;
          }
        }
        return false;
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        for (const file of files) {
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            uploadImage(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  // 上传图片到服务器
  const uploadImage = useCallback(
    async (file: File) => {
      if (!editor) return;

      // 校验文件类型
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        alert("仅支持 JPG、PNG、GIF、WebP 格式的图片");
        return;
      }

      // 校验文件大小（10MB）
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("图片大小不能超过 10MB");
        return;
      }

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/files", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("上传失败");
        }

        const data = await res.json();
        const imageUrl = `/uploads/${data.filename}`;

        // 在光标位置插入图片
        editor.chain().focus().setImage({ src: imageUrl, alt: data.original_name }).run();
      } catch (error) {
        alert("图片上传失败，请重试");
        console.error("Image upload error:", error);
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  // 处理工具栏按钮点击
  const handleAction = (action: string, attrs?: Record<string, unknown>) => {
    if (!editor) return;

    const chain = editor.chain().focus();

    switch (action) {
      case "paragraph":
        chain.setParagraph().run();
        break;
      case "heading1":
        chain.toggleHeading({ level: 1 }).run();
        break;
      case "heading2":
        chain.toggleHeading({ level: 2 }).run();
        break;
      case "heading3":
        chain.toggleHeading({ level: 3 }).run();
        break;
      case "bold":
        chain.toggleBold().run();
        break;
      case "italic":
        chain.toggleItalic().run();
        break;
      case "underline":
        chain.toggleUnderline().run();
        break;
      case "strike":
        chain.toggleStrike().run();
        break;
      case "bulletList":
        chain.toggleBulletList().run();
        break;
      case "orderedList":
        chain.toggleOrderedList().run();
        break;
      case "blockquote":
        chain.toggleBlockquote().run();
        break;
      case "link": {
        const previous = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("链接地址：", previous || "https://");
        if (url === null) break;
        if (url === "") {
          chain.extendMarkRange("link").unsetLink().run();
        } else {
          chain.extendMarkRange("link").setLink({ href: url }).run();
        }
        break;
      }
      case "undo":
        chain.undo().run();
        break;
      case "redo":
        chain.redo().run();
        break;
    }
  };

  // 清除行内样式（颜色 / 背景色 / 字号）
  const handleClearInlineStyles = () => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .unsetColor()
      .unsetBackgroundColor()
      .unsetFontSize()
      .run();
  };

  // 检查按钮是否激活
  const isActive = (action: string | undefined, attrs?: Record<string, unknown>) => {
    if (!editor || !action) return false;

    switch (action) {
      case "bold":
        return editor.isActive("bold");
      case "italic":
        return editor.isActive("italic");
      case "underline":
        return editor.isActive("underline");
      case "strike":
        return editor.isActive("strike");
      case "bulletList":
        return editor.isActive("bulletList");
      case "orderedList":
        return editor.isActive("orderedList");
      case "blockquote":
        return editor.isActive("blockquote");
      case "heading":
        return editor.isActive("heading", attrs);
      default:
        return false;
    }
  };

  if (!editor) {
    return null;
  }

  const textStyleAttrs = editor.getAttributes("textStyle") as {
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
  };
  const currentFontSize = textStyleAttrs.fontSize || "";

  return (
    <div className="border border-white/20 rounded-xl overflow-hidden bg-white/5">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-white/10 bg-white/5">
        {toolbarButtons.map((btn) => {
          const Icon = btn.icon;
          const active = isActive(btn.active, btn.attrs);

          return (
            <button
              key={btn.action}
              type="button"
              onClick={() => handleAction(btn.action, btn.attrs)}
              className={`p-2 rounded-lg transition-colors ${
                active
                  ? "bg-white/20 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
              title={btn.title}
            >
              <Icon size={18} />
            </button>
          );
        })}

        <span className="w-px h-5 bg-white/15 mx-1" />

        {/* 字号选择 */}
        <select
          value={currentFontSize}
          onChange={(e) => {
            const size = e.target.value;
            if (size) {
              editor.chain().focus().setFontSize(size).run();
            } else {
              editor.chain().focus().unsetFontSize().run();
            }
          }}
          className="bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white/80 focus:outline-none focus:border-white/40 [&>option]:bg-[#1e1e2e]"
          title="字号"
        >
          {FONT_SIZES.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>

        {/* 文字颜色 */}
        <label
          className="relative flex items-center gap-1 p-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          title="文字颜色"
        >
          <span className="text-sm font-semibold leading-none">A</span>
          <span
            className="w-3.5 h-1.5 rounded-sm border border-white/30"
            style={{ backgroundColor: textStyleAttrs.color || "#ffffff" }}
          />
          <input
            type="color"
            value={textStyleAttrs.color || "#ffffff"}
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>

        {/* 背景颜色 */}
        <label
          className="relative p-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          title="背景颜色"
        >
          <Highlighter size={18} />
          <span
            className="absolute left-1.5 right-1.5 bottom-1 h-1 rounded-sm"
            style={{ backgroundColor: textStyleAttrs.backgroundColor || "#facc15" }}
          />
          <input
            type="color"
            value={textStyleAttrs.backgroundColor || "#facc15"}
            onChange={(e) =>
              editor.chain().focus().setBackgroundColor(e.target.value).run()
            }
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>

        {/* 清除行内样式 */}
        <button
          type="button"
          onClick={handleClearInlineStyles}
          className="p-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          title="清除文字颜色/背景色/字号"
        >
          <Eraser size={18} />
        </button>

        <span className="w-px h-5 bg-white/15 mx-1" />

        {/* 图片上传按钮 */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
          title="插入图片"
        >
          <ImageIcon size={18} />
        </button>

        {uploading && (
          <span className="text-xs text-white/50 ml-2">上传中...</span>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              uploadImage(file);
            }
            e.target.value = "";
          }}
        />
      </div>

      {/* 编辑区域 */}
      <EditorContent editor={editor} />
    </div>
  );
}
