"use client";

import { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";

interface AdminRichTextProps {
  value: string;
  onChange: (html: string) => void;
}

export default function AdminRichText({ value, onChange }: AdminRichTextProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize textarea based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribe el contenido aquí. Puedes usar HTML básico como <p>, <strong>, <em>, etc."
        className="font-neutra text-[15px] leading-[22px] min-h-[120px]"
        rows={5}
      />
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border font-neutra">
        <strong>Tip:</strong> Puedes usar etiquetas HTML como{" "}
        <code className="bg-white px-1 rounded">&lt;p&gt;</code>,{" "}
        <code className="bg-white px-1 rounded">&lt;strong&gt;</code>,{" "}
        <code className="bg-white px-1 rounded">&lt;em&gt;</code>,{" "}
        <code className="bg-white px-1 rounded">&lt;br&gt;</code>
      </div>
    </div>
  );
}
