"use client";

import { MouseEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

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

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // Pegar como HTML limpio básico (permitimos el propio contenteditable formatear)
    // Para simplificar, pegamos texto plano y dejamos que el usuario
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
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
        style={{ whiteSpace: "pre-wrap" }}
        suppressContentEditableWarning
        aria-label="Editor de texto enriquecido"
      />

      <div className="text-[11px] text-gray-500">
        Escribe como en Word: selecciona texto y usa la barra para negrita,
        cursiva, títulos, listas y enlaces.
      </div>
    </div>
  );
}
