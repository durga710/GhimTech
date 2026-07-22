import Image from "next/image";
import { cn } from "@/lib/utils";

interface ScreenshotFrameProps {
  src: string;
  alt: string;
  /** Optional source label shown below the screenshot. */
  url?: string;
  /** Pass true for above-the-fold usage (hero) so Next.js preloads the image. */
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * A restrained, contained presentation for real product screenshots.
 * Every image rendered here is captured from the live, running product —
 * never a mockup (see public/products/).
 */
export function ScreenshotFrame({
  src,
  alt,
  url,
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className,
}: ScreenshotFrameProps) {
  return (
    <figure
      data-screenshot-treatment="contained"
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-2 sm:p-3",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={1000}
        priority={priority}
        sizes={sizes}
        className="h-auto max-h-[720px] w-full rounded-md bg-white object-contain object-top"
      />
      {url ? <figcaption className="px-1 pb-1 pt-3 text-xs text-slate-500">Live product · {url}</figcaption> : null}
    </figure>
  );
}
