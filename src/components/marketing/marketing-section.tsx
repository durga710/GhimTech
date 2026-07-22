import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MarketingSection({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("section-band", className)}>
      <div className="container">{children}</div>
    </section>
  );
}

export function MarketingSectionHeader({
  eyebrow,
  title,
  body,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <div className="section-kicker">
        {eyebrow}
      </div>
      <h2 className="mt-5 text-balance font-display text-[clamp(2.2rem,4.5vw,4rem)] leading-[1.03] tracking-[-0.04em] text-slate-950">
        {title}
      </h2>
      {body ? (
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 lg:text-lg">
          {body}
        </p>
      ) : null}
    </div>
  );
}
