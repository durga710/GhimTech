import type { Metadata } from 'next';
import { ButtonLink, TextLink } from '@/components/ui/button';
import { Callout } from '@/components/ui/surface';
import { PageHero } from '@/components/marketing/page-hero';
import { MarketingSection } from '@/components/marketing/section';
import { DetailList, List, Prose } from '@/components/marketing/prose';
import {
  CONTACT_EMAIL,
  CONTACT_MAILTO,
  RESPONSE_INTENT,
} from '@/components/marketing/site-contact';

const description =
  'GhimTech Tax targets WCAG 2.2 Level AA. What has been built in — landmarks, keyboard operation, visible focus, contrast, reduced motion, labelled forms — the gaps we know about, and how to report a barrier.';

const LAST_REVIEWED = '1 August 2026';

export const metadata: Metadata = {
  title: 'Accessibility statement',
  description,
  alternates: { canonical: '/accessibility' },
  openGraph: {
    type: 'website',
    url: '/accessibility',
    title: 'Accessibility statement · GhimTech Tax',
    description,
  },
};

export default function AccessibilityPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        eyebrow="Trust"
        title="Accessibility statement"
        lead="Filing a tax return is not optional, so the software used to file one should not be usable only by people who browse a particular way. We build to WCAG 2.2 Level AA, and this page says where we meet it and where we do not."
        meta={`Last reviewed ${LAST_REVIEWED}`}
      />

      <MarketingSection
        id="target"
        eyebrow="The standard"
        title="What we are aiming at"
        bordered={false}
      >
        <Prose>
          <p>
            Our target is the Web Content Accessibility Guidelines version 2.2, Level AA, across the
            public site, the preparer workspace and the client portal.
          </p>
          <p>
            &ldquo;Target&rdquo; is the honest word. We have not commissioned an independent audit,
            and until we have, we will not describe the product as conformant — a claim of
            conformance made by the people who wrote the code is worth very little. What follows is
            what we have actually built and what we know is still missing.
          </p>
        </Prose>
      </MarketingSection>

      <MarketingSection
        id="what-is-in-place"
        eyebrow="Built in"
        title="What is in place today"
        lead="These are decisions in the design system rather than fixes applied to individual screens, which is why they hold across pages rather than only on the ones somebody remembered to check."
        tone="alt"
      >
        <DetailList
          columns={2}
          items={[
            {
              term: 'Semantic structure and landmarks',
              description:
                'Each page has exactly one h1 and a heading order that does not skip levels. Content sits inside real landmarks — banner, navigation, main, region, contentinfo — and long pages name their sections so that a screen reader can jump between them instead of reading from the top.',
            },
            {
              term: 'Keyboard operation',
              description:
                'Every interactive element is reachable and operable from the keyboard in a sensible order, menus can be dismissed with Escape, and a skip link at the top of every page jumps straight to the main content.',
            },
            {
              term: 'Visible focus, always',
              description:
                'A two-pixel focus ring with an offset is applied globally and is never removed — the design system permits a component to replace it, never to delete it. If you can tab to something, you can see where you are.',
            },
            {
              term: 'Contrast',
              description:
                'The palette is defined in a perceptual colour space so that text and background pairings hold a predictable contrast step, and pairings are chosen against the 4.5:1 requirement for body text and 3:1 for large text and interface boundaries. This holds in both the light and the dark theme.',
            },
            {
              term: 'Reduced motion',
              description:
                'The whole interface honours prefers-reduced-motion: animations and transitions collapse to nothing, and smooth scrolling is switched off. Nothing in the product moves for decoration in the first place.',
            },
            {
              term: 'Forms that explain themselves',
              description:
                'Every control is joined to its label, its hint and its error through real element ids, so guidance is announced rather than merely displayed. Errors appear beneath the field, in words, and are announced when they appear — a field is never only reddened.',
            },
            {
              term: 'Never colour alone',
              description:
                'Status and severity always carry a word as well as a colour, and the four diagnostic severities differ in treatment — solid, tinted, outlined — as well as in hue, so they survive colour-vision deficiency and a poor display.',
            },
            {
              term: 'Text, zoom and reflow',
              description:
                'Layouts are built in relative units and reflow to a single column on a narrow viewport, so text can be enlarged or the page zoomed to 200 percent without content being clipped or requiring horizontal scrolling.',
            },
            {
              term: 'Light and dark',
              description:
                'The theme follows your operating system by default and can be overridden. Both themes are designed rather than inverted, so contrast is not sacrificed in either one.',
            },
            {
              term: 'Numbers that line up',
              description:
                'Amounts and identifiers are set in tabular figures throughout, which makes a column of dollar amounts readable as a column rather than as a ragged list — a legibility decision as much as a typographic one.',
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection
        id="gaps"
        eyebrow="Honestly"
        title="What we know is not there yet"
        lead="Every accessibility statement that lists only achievements is incomplete. Here is the other half."
      >
        <Prose>
          <List
            items={[
              'No independent audit has been carried out. Our testing is our own, and self-assessment reliably misses things.',
              'The authenticated product — the preparer workspace and the client portal — has had less accessibility attention than the public pages, and parts of it have not been reviewed against WCAG 2.2 at all.',
              'Dense financial tables need more work. Row and column relationships are marked up, but long tables would benefit from better summaries and from a keyboard experience designed for them specifically rather than inherited.',
              'Generated PDF documents — the return itself, and printable summaries — are not yet produced as tagged, accessible PDFs. If you need a return in an accessible format, ask us and we will provide one another way.',
              'We have not tested every combination of assistive technology and browser. Our regular testing covers keyboard-only operation, zoom to 200 percent, contrast checks, and screen reader passes with VoiceOver and NVDA. That is a real set, but it is not exhaustive.',
              'Some complex controls — date entry and a few multi-step flows in the workspace — are on the list to be rebuilt against the WCAG 2.2 additions covering focus appearance, dragging alternatives and target size.',
              'Where a taxing authority requires a specific form or document format, we do not control that format and cannot always make it accessible.',
            ]}
          />
          <p>
            None of this is listed as an excuse. It is listed because a person deciding whether this
            software will work for them deserves to know before they commit a filing season to it.
          </p>
        </Prose>
      </MarketingSection>

      <MarketingSection id="how-we-test" eyebrow="Method" title="How we check our work" tone="alt">
        <Prose>
          <p>
            Accessibility is checked while a screen is being built rather than in a pass at the end.
            In practice that means: navigating each new screen with the keyboard only, before it is
            considered done; checking contrast pairs against the token palette rather than
            eyeballing them; verifying that every form control announces its label, hint and error;
            reading pages at 200 percent zoom and at a 320 pixel width; and running a screen reader
            over anything with a non-obvious structure.
          </p>
          <p>
            Automated checking catches a useful minority of problems and we use it, but no automated
            tool can tell you that a heading structure is misleading or that an error message is
            unhelpful. Those are read by a person.
          </p>
        </Prose>
      </MarketingSection>

      <MarketingSection id="report" eyebrow="Tell us" title="Reporting a barrier">
        <Prose>
          <p>
            If something on this site or in the product stops you, please write to{' '}
            <TextLink href={CONTACT_MAILTO}>{CONTACT_EMAIL}</TextLink> with
            &ldquo;Accessibility&rdquo; in the subject line. It helps if you can include:
          </p>
          <List
            items={[
              'the page or screen, and the web address if you have it;',
              'what you were trying to do and what happened instead;',
              'the browser and operating system you were using; and',
              'any assistive technology involved, and its version if you know it.',
            ]}
          />
          <p>
            We intend to acknowledge a report within {RESPONSE_INTENT}, and to tell you what we
            found and when it will be fixed rather than closing the thread with a thank-you. We treat
            barriers as defects, not as feedback.
          </p>
          <Callout tone="info" title="If you need something another way">
            If a barrier is blocking you from something time-sensitive — a document, a signature, a
            filing deadline — say so in the first line of your message. We will find another way to
            get you what you need while the underlying problem is being fixed.
          </Callout>
        </Prose>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/contact" size="lg">
            Contact us
          </ButtonLink>
          <ButtonLink href={CONTACT_MAILTO} variant="secondary" size="lg">
            Email {CONTACT_EMAIL}
          </ButtonLink>
        </div>
      </MarketingSection>

      <MarketingSection id="status" eyebrow="Provenance" title="About this statement" tone="alt">
        <Prose>
          <p>
            This statement was last reviewed on {LAST_REVIEWED}. It is based on our own evaluation
            of the site and the product against WCAG 2.2 Level AA, and it will be revised as the
            product changes and as gaps close. Like the other documents on this site, it is subject
            to review before general release.
          </p>
          <p>
            If you believe a claim on this page overstates what the product does, that is itself
            worth reporting — and we would rather hear it from you than not hear it at all.
          </p>
        </Prose>
      </MarketingSection>
    </>
  );
}
