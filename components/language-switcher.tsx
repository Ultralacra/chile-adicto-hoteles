"use client";

import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const other = language === "es" ? "en" : "es";
  const flagSrc = other === "es" ? "/flags/cl.svg" : "/flags/us.svg";
  const label = other.toUpperCase();

  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage(other as "es" | "en")}
        className="text-[16px] leading-[20px] font-medium flex items-center font-neutra"
        aria-label={`Switch language to ${label}`}
      >
        {label}
        <Image
          src={flagSrc}
          alt={`Flag ${label}`}
          width={20}
          height={14}
          className="ml-2"
        />
      </Button>
    </div>
  );
}
