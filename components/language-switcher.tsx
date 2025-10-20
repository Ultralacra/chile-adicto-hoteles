"use client";

import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={language === "es" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("es")}
        className="text-[16px] leading-[20px] font-medium flex items-center font-neutra"
      >
        ES
        <Image
          src="/flags/cl.svg"
          alt="Flag Chile"
          width={20}
          height={14}
          className="ml-2"
        />
      </Button>
      <Button
        variant={language === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("en")}
        className="text-[16px] leading-[20px] font-medium flex items-center font-neutra"
      >
        EN
        <Image
          src="/flags/us.svg"
          alt="Flag US"
          width={20}
          height={14}
          className="ml-2"
        />
      </Button>
    </div>
  );
}
