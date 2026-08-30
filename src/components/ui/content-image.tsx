import Image from "next/image";
import { cn } from "@/lib/utils";

const aspectClasses = {
  video: "aspect-video",
  square: "aspect-square",
  wide: "aspect-[21/9]",
  portrait: "aspect-[4/5]",
  auto: "min-h-[12rem]",
} as const;

export function ContentImage({
  src,
  alt,
  className,
  imageClassName,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 1200px",
  aspect = "video",
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  aspect?: keyof typeof aspectClasses;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-ash-100",
        aspectClasses[aspect],
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("object-cover", imageClassName)}
        sizes={sizes}
        priority={priority}
      />
    </div>
  );
}
