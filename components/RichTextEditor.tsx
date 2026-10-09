"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
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
} from "lucide-react";
import { useRef, useState, useCallback } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

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
  { icon: Undo, action: "undo", title: "撤销" },
  { icon: Redo, action: "redo", title: "重做" },
];

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder: "开始写笔记...",
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
      case "undo":
        chain.undo().run();
        break;
      case "redo":
        chain.redo().run();
        break;
    }
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

  return (
    <div className="border border-white/20 rounded-xl overflow-hidden bg-white/5">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-white/10 bg-white/5">
        {toolbarButtons.map((btn, index) => {
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
