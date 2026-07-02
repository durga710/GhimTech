import Image from "next/image";
import { cn } from "@/lib/utils";

interface ScreenshotFrameProps {
  src: string;
  alt: string;
  /** Display URL shown in the frame's address bar, e.g. "rayhealthevv.com/admin". */
  url?: string;
  /** Pass true for above-the-fold usage (hero) so Next.js preloads the image. */
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * Browser-chrome frame around a real product screenshot.
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
      className={cn(
        "overflow-hidden rounded-xl border border-white/[0.09] bg-ink-950/70 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.7)]",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
        </span>
        {url ? (
          <span className="ml-2 truncate rounded-md border border-white/[0.06] bg-ink-950/60 px-2.5 py-0.5 font-mono text-[11px] text-zinc-400">
            {url}
          </span>
        ) : null}
      </div>
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={1000}
        priority={priority}
        sizes={sizes}
        className="h-auto w-full"
      />
    </figure>
  );
}
