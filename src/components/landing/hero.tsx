import { ArrowDown } from "lucide-react";
import { HERO } from "@/lib/content";
import { MarketingButton } from "@/components/marketing/marketing-button";

export function Hero() {
  return (
    <section className="border-b border-slate-200 pb-20 pt-36 lg:pb-28 lg:pt-44">
      <div className="container max-w-5xl">
          <p className="section-kicker mb-7">{HERO.eyebrow}</p>
          <h1 className="text-balance max-w-4xl font-display text-[clamp(3rem,6vw,5.8rem)] leading-[1.02] tracking-[-0.045em] text-slate-950">
            {HERO.headline}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600 lg:text-xl">
            {HERO.sub}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <MarketingButton href={HERO.primaryCta.href}>{HERO.primaryCta.label}</MarketingButton>
            <MarketingButton href={HERO.secondaryCta.href} variant="secondary">{HERO.secondaryCta.label}</MarketingButton>
          </div>
          <a href="#products" className="mt-16 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-950">
            See the work <ArrowDown aria-hidden className="h-4 w-4" />
          </a>
      </div>
    </section>
  );
}
