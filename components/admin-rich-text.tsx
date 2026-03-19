"use client";

import { MouseEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "div",
  "i",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "ol",
  "p",
  "span",
  "strong",
  "sub",
  "sup",
  "u",
  "ul",
  "em",
]);

const BLOCK_TAGS = new Set([
  "blockquote",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "ol",
  "p",
  "ul",
]);

const BOLD_WEIGHT_PATTERN = /^(?:bold|bolder|[6-9]00)$/i;
const ITALIC_STYLE_PATTERN = /^(?:italic|oblique)$/i;

interface AdminRichTextProps {
  value: string;
  onChange: (html: string) => void;
}

export default function AdminRichText({ value, onChange }: AdminRichTextProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);

  // Sincronizar contenido externo -> editor
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (editorRef.current?.contains(range.commonAncestorContainer)) {
      selectionRef.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (!selection || !selectionRef.current) return;

    selection.removeAllRanges();
    selection.addRange(selectionRef.current);
  };

  const exec = (cmd: string, value?: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(cmd, false, value);
    saveSelection();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const toggleBlock = (block: "p" | "h2" | "h3") =>
    exec("formatBlock", `<${block}>`);

  const handleToolbarMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    saveSelection();
  };

  const onInput = () => {
    saveSelection();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const sanitizeHref = (href: string) => {
    const normalized = href.trim().replace(/^['\"]+|['\"]+$/g, "");
    if (!normalized) return "";

    if (/^(?:https?:|mailto:|tel:|\/|#)/i.test(normalized)) {
      return normalized;
    }

    if (/^[a-z0-9.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(normalized)) {
      return `https://${normalized}`;
    }

    return "";
  };

  const getSemanticFormats = (
    element: HTMLElement,
  ): Array<"strong" | "em" | "u"> => {
    const formats = new Set<"strong" | "em" | "u">();
    const tag = element.tagName.toLowerCase();

    if (tag === "b" || tag === "strong") formats.add("strong");
    if (tag === "i" || tag === "em") formats.add("em");
    if (tag === "u") formats.add("u");

    const styleValue = element.getAttribute("style") || "";
    styleValue
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => {
        const separator = part.indexOf(":");
        if (separator === -1) return;

        const property = part.slice(0, separator).trim().toLowerCase();
        const value = part
          .slice(separator + 1)
          .trim()
          .replace(/\s+/g, " ");

        if (property === "font-weight" && BOLD_WEIGHT_PATTERN.test(value)) {
          formats.add("strong");
        }

        if (property === "font-style" && ITALIC_STYLE_PATTERN.test(value)) {
          formats.add("em");
        }

        if (property === "text-decoration" && /underline/i.test(value)) {
          formats.add("u");
        }
      });

    return Array.from(formats);
  };

  const hasMeaningfulContent = (node: Node): boolean => {
    if (node.nodeType === Node.TEXT_NODE) {
      return Boolean(node.textContent?.replace(/\u00a0/g, " ").trim());
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return false;

    const element = node as HTMLElement;
    if (element.tagName.toLowerCase() === "br") return true;

    return Array.from(element.childNodes).some((child) =>
      hasMeaningfulContent(child),
    );
  };

  const trimBoundaryWhitespace = (nodes: Node[]): Node[] => {
    const normalized = [...nodes];

    while (
      normalized[0]?.nodeType === Node.TEXT_NODE &&
      !normalized[0].textContent?.replace(/\u00a0/g, " ").trim()
    ) {
      normalized.shift();
    }

    while (
      normalized[normalized.length - 1]?.nodeType === Node.TEXT_NODE &&
      !normalized[normalized.length - 1].textContent
        ?.replace(/\u00a0/g, " ")
        .trim()
    ) {
      normalized.pop();
    }

    return normalized;
  };

  const sanitizeNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      const normalizedText = (node.textContent || "").replace(/\u00a0/g, " ");
      return document.createTextNode(normalizedText);
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (["meta", "link", "script", "style", "xml"].includes(tag)) {
      return null;
    }

    const childNodes = trimBoundaryWhitespace(
      Array.from(element.childNodes)
        .map((child) => sanitizeNode(child))
        .filter((child): child is Node => Boolean(child)),
    );

    if (!ALLOWED_TAGS.has(tag)) {
      if (childNodes.length === 0) return null;
      const fragment = document.createDocumentFragment();
      childNodes.forEach((child) => fragment.appendChild(child));
      return fragment;
    }

    if (tag === "div") {
      const hasBlockChildren = childNodes.some(
        (child) =>
          child.nodeType === Node.ELEMENT_NODE &&
          BLOCK_TAGS.has((child as HTMLElement).tagName.toLowerCase()),
      );

      if (hasBlockChildren) {
        if (childNodes.length === 0) return null;
        const fragment = document.createDocumentFragment();
        childNodes.forEach((child) => fragment.appendChild(child));
        return fragment;
      }
    }

    const outputTag =
      tag === "div" ? "p" : tag === "b" ? "strong" : tag === "i" ? "em" : tag;

    if (outputTag === "span") {
      if (childNodes.length === 0) return null;

      const fragment = document.createDocumentFragment();
      childNodes.forEach((child) => fragment.appendChild(child));

      let formattedNode: Node = fragment;
      const formats = getSemanticFormats(element);
      formats.forEach((formatTag) => {
        const wrapper = document.createElement(formatTag);
        wrapper.appendChild(formattedNode);
        formattedNode = wrapper;
      });

      return formattedNode;
    }

    const sanitizedElement = document.createElement(outputTag);

    if (outputTag === "a") {
      const href = sanitizeHref(element.getAttribute("href") || "");
      if (href) {
        sanitizedElement.setAttribute("href", href);
        if (/^https?:\/\//i.test(href)) {
          sanitizedElement.setAttribute("target", "_blank");
          sanitizedElement.setAttribute("rel", "noopener noreferrer");
        }
      }
    }

    childNodes.forEach((child) => sanitizedElement.appendChild(child));

    getSemanticFormats(element).forEach((formatTag) => {
      if (formatTag !== outputTag) {
        const wrapper = document.createElement(formatTag);
        while (sanitizedElement.firstChild) {
          wrapper.appendChild(sanitizedElement.firstChild);
        }
        sanitizedElement.appendChild(wrapper);
      }
    });

    if (BLOCK_TAGS.has(outputTag) && !hasMeaningfulContent(sanitizedElement)) {
      return null;
    }

    return sanitizedElement;
  };

  const sanitizePastedHtml = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const container = document.createElement("div");

    Array.from(doc.body.childNodes)
      .map((node) => sanitizeNode(node))
      .filter((node): node is Node => Boolean(node))
      .forEach((node) => container.appendChild(node));

    return container.innerHTML;
  };

  const insertHtml = (html: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand("insertHTML", false, html);
    saveSelection();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const html = e.clipboardData.getData("text/html");
    if (html) {
      const sanitizedHtml = sanitizePastedHtml(html);
      if (sanitizedHtml.trim()) {
        insertHtml(sanitizedHtml);
        return;
      }
    }

    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    saveSelection();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 text-xs">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => exec("bold")}
        >
          B
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => exec("italic")}
        >
          <em>I</em>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => exec("underline")}
        >
          <u>U</u>
        </Button>
        <span className="w-px h-6 bg-gray-200" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => toggleBlock("p")}
        >
          P
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => toggleBlock("h2")}
        >
          H2
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => toggleBlock("h3")}
        >
          H3
        </Button>
        <span className="w-px h-6 bg-gray-200" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => exec("insertUnorderedList")}
        >
          • Lista
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => exec("insertOrderedList")}
        >
          1. Lista
        </Button>
        <span className="w-px h-6 bg-gray-200" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => {
            saveSelection();
            const url = prompt("Insertar enlace (URL)");
            if (url) exec("createLink", url);
          }}
        >
          Link
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => exec("unlink")}
        >
          Quitar link
        </Button>
        <span className="w-px h-6 bg-gray-200" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => exec("removeFormat")}
        >
          Limpiar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => exec("undo")}
        >
          ↶
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={handleToolbarMouseDown}
          onClick={() => exec("redo")}
        >
          ↷
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onFocus={saveSelection}
        onInput={onInput}
        onBlur={onInput}
        onPaste={onPaste}
        className="font-neutra text-[15px] leading-[22px] min-h-[140px] p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-white [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-3 [&_li]:my-1 [&_p]:my-2 [&_a]:text-green-700 [&_a]:underline"
        suppressContentEditableWarning
        aria-label="Editor de texto enriquecido"
      />

      <div className="text-[11px] text-gray-500">
        Pega contenido desde Word conservando negrita, cursiva, subrayado,
        listas, títulos y enlaces. El tamaño y la fuente los maneja el front.
      </div>
    </div>
  );
}
