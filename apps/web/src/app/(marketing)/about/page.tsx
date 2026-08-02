import type { Metadata } from 'next';
import { ButtonLink, TextLink } from '@/components/ui/button';
import { GhimTechTaxLockup } from '@/components/brand/logo';
import { PageHero } from '@/components/marketing/page-hero';
import { MarketingSection } from '@/components/marketing/section';
import { DetailList, List, Prose } from '@/components/marketing/prose';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/components/marketing/site-contact';

const description =
  'GhimTech builds practical software for regulated work — the kind where the record matters as much as the result. GhimTech Tax is what that looks like applied to Federal and Pennsylvania tax preparation.';

export const metadata: Metadata = {
  title: 'About GhimTech',
  description,
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'website',
    url: '/about',
    title: 'About GhimTech · GhimTech Tax',
    description,
  },
};

export default function AboutPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        eyebrow="Company"
        title="We build practical software for regulated work"
        lead="GhimTech is an engineering company. GhimTech Tax is the practice we built for Federal and Pennsylvania tax preparation — one product, one jurisdiction pair, and a deliberately narrow scope we would rather do properly than broadly."
      />

      <MarketingSection
        id="what-we-do"
        eyebrow="What we do"
        title="Software for work that has to be defensible"
        bordered={false}
      >
        <Prose>
          <p>
            Some software fails quietly and nobody minds. Other software fails and somebody has to
            explain it — to a client, to an auditor, to a regulator, occasionally to a court. We
            build the second kind. Tax preparation, care records, compliance workflows: work where
            the output has to be right and the record of how it got there has to survive being
            examined a year later.
          </p>
          <p>
            That shapes decisions all the way down. It is why this product logs who read a return
            and not only who changed it, why identifiers are masked by default rather than on
            request, and why a rule the software applies can be traced back to the constant it used
            rather than disappearing into a formula.
          </p>
        </Prose>
      </MarketingSection>

      <MarketingSection
        id="why-tax"
        eyebrow="Why this product"
        title="Why tax, and why Pennsylvania"
        tone="alt"
      >
        <Prose>
          <p>
            Tax preparation is a records discipline with a deadline attached. The calculation is
            usually the easy part; the hard parts are collecting documents from people who are busy,
            keeping track of which figures came from where, catching the error before it becomes a
            rejection, and being able to show your working afterwards. Most of the software in this
            field is either built for consumers filing one simple return, or it is a twenty-year-old
            professional suite that a preparer tolerates rather than uses.
          </p>
          <p>
            We started with Federal and Pennsylvania because Pennsylvania is where we work, and
            because it is a genuinely instructive state to build for. A flat tax that is anything
            but simple, income sorted into classes that cannot offset each other, retirement rules
            that diverge from the federal treatment in ways that catch people out, and a third
            return filed locally that a lot of taxpayers forget entirely. Software that handles
            Pennsylvania honestly has to take state rules seriously rather than treating them as a
            federal return with a different cover sheet.
          </p>
          <p>
            One tax year, two jurisdictions, a defined list of situations. When that is solid, we
            will extend it. Not before.
          </p>
        </Prose>
      </MarketingSection>

      <MarketingSection id="how-we-work" eyebrow="How we work" title="A few commitments">
        <DetailList
          columns={2}
          items={[
            {
              term: 'Write the rule down, then test it',
              description:
                'Every threshold and constant the engine uses is stated explicitly and reconciled against the published source before it is trusted, and diagnostics cite the constant they relied on. A tax figure that appears out of nowhere in a codebase is a bug waiting for a season.',
            },
            {
              term: 'Narrow and correct over broad and approximate',
              description:
                'We would rather tell you a situation is unsupported than half-support it. The supported situations page exists to make that easy to check before you commit a client to us.',
            },
            {
              term: 'Boring technology',
              description:
                'Nothing in the stack is chosen to be interesting. Software that holds tax records should be predictable, upgradeable, and legible to whoever maintains it after us.',
            },
            {
              term: 'Accessible by default, not by retrofit',
              description:
                'Focus rings, semantic structure, labelled controls and reduced-motion support are part of the design system rather than a remediation project. Where we fall short we say so on the accessibility statement.',
            },
            {
              term: 'No dark patterns',
              description:
                'No fee revealed at the last screen, no upsell disguised as a warning, no consent buried in a flow. A product that handles someone’s finances has no business manipulating them.',
            },
            {
              term: 'Say the unflattering thing',
              description:
                'Where something is not built, not certified, or not yet reliable, the site says so in the same typeface as everything else.',
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection
        id="not-here"
        eyebrow="Plainly"
        title="What you will not find on this page"
        tone="alt"
      >
        <Prose>
          <p>
            No customer count. No filing statistics. No logo wall, no testimonials, no funding
            announcement, no headcount, and no origin story about a founder&rsquo;s difficult April.
          </p>
          <p>
            We have not earned those claims, and inventing them would be the single most revealing
            thing we could do on a site that asks you to trust us with Social Security numbers. When
            there are numbers worth publishing, we will publish the real ones and say how they were
            counted.
          </p>
          <p>What we will tell you, if you ask:</p>
          <List
            items={[
              'Exactly where a feature stands, rather than which quarter it is on a roadmap.',
              'Which infrastructure providers hold your data.',
              'What we have and have not had independently assessed.',
              'Why we made a particular design decision, including the ones we are not sure about.',
            ]}
          />
        </Prose>
      </MarketingSection>

      <MarketingSection id="contact" eyebrow="Get in touch" title="Talk to us">
        <Prose>
          <p>
            One address, read by the people who build the product:{' '}
            <TextLink href={CONTACT_MAILTO}>{CONTACT_EMAIL}</TextLink>. Questions about whether your
            returns fit, questions about security, and reports of things we have got wrong are all
            equally welcome — the third kind most of all.
          </p>
        </Prose>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/contact" size="lg">
            Contact us
          </ButtonLink>
          <ButtonLink href="/security" variant="secondary" size="lg">
            How we handle your data
          </ButtonLink>
        </div>
        <div className="mt-12 border-t border-line-subtle pt-8">
          <GhimTechTaxLockup withDescriptor markSize={34} />
        </div>
      </MarketingSection>
    </>
  );
}
