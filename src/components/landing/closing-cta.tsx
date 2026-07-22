import { MarketingButton } from "@/components/marketing/marketing-button";

/**
 * Closing CTA — invites serious conversations before the footer.
 * Contact is primary; the product roster is the secondary path.
 */
export function ClosingCta() {
  return (
    <section className="border-y border-slate-200 bg-white py-24 lg:py-28">

      <div className="container relative max-w-4xl text-center">
        <span className="section-kicker">
          Work with GhimTech
        </span>

        <h2 className="mt-6 text-balance font-display text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.02] tracking-[-0.04em] text-slate-950">
          Bring the problem that has to work.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
          Agencies, partners, engineers, investors, and technical buyers — if the
          software has to be trusted under pressure, that is the work GhimTech takes seriously.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <MarketingButton href="/contact" variant="vital">Start a serious conversation</MarketingButton>
          <MarketingButton href="/#products" variant="secondary">Review products</MarketingButton>
        </div>
      </div>
    </section>
  );
}
