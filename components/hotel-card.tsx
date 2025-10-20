import Image from "next/image";
import Link from "next/link";

interface HotelCardProps {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
}

export function HotelCard({
  slug,
  name,
  subtitle,
  description,
  image,
}: HotelCardProps) {
  return (
    <Link href={`/hotel/${slug}`}>
      <article className="group cursor-pointer flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden mb-4">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="space-y-2 flex-1">
          {/* Heart Icon and Title */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div
                className="flex items-center justify-center"
                style={{ width: 41, height: 50 }}
              >
                <img
                  src="/favicon.svg"
                  alt="icon"
                  style={{ width: 41, height: 50 }}
                />
              </div>
            </div>

            <div className="flex-1">
              <h2 className="font-neutra text-[15px] font-normal text-black leading-[19px] mb-1 first-line:font-[600]">
                {name}
              </h2>
              <p className="font-neutra text-[15px] font-normal text-black uppercase leading-[19px]">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="font-neutra text-[15px] text-black leading-[22px] font-normal">
            {description}
          </p>
        </div>

        {/* Elegant divider pushed to bottom so all cards align */}
        <div className="mt-auto pt-4">
          <div className="mx-auto h-[1px] w-3/4 bg-[#b4b4b8]" />
        </div>
      </article>
    </Link>
  );
}
