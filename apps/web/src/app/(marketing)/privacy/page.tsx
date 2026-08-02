import type { Metadata } from 'next';
import { TextLink } from '@/components/ui/button';
import { Callout } from '@/components/ui/surface';
import { PageHero } from '@/components/marketing/page-hero';
import { LegalDocument, type LegalSection } from '@/components/marketing/legal-document';
import { List, Token } from '@/components/marketing/prose';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/components/marketing/site-contact';

const description =
  'The GhimTech Tax privacy policy: what information we collect, how tax return information is treated, who we share it with, how long we keep it, and the choices available to you.';

const LAST_UPDATED = '1 August 2026';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description,
  alternates: { canonical: '/privacy' },
  openGraph: {
    type: 'website',
    url: '/privacy',
    title: 'Privacy policy · GhimTech Tax',
    description,
  },
};

const SECTIONS: LegalSection[] = [
  {
    id: 'scope',
    title: 'Scope of this policy',
    body: (
      <>
        <p>
          This policy describes how GhimTech handles personal information in connection with the
          GhimTech Tax website and the GhimTech Tax software (together, the &ldquo;service&rdquo;).
          It covers the public pages you are reading now, the preparer workspace, and the client
          portal.
        </p>
        <p>
          Where a tax practice uses the software to prepare returns for its own clients, that
          practice decides what information is collected and why, and we process it on their
          instructions. In that arrangement the practice is the party a taxpayer should approach
          first about their own records; we will support any request that reaches us and tell the
          practice about it.
        </p>
        <p>
          This policy does not cover any website or service operated by someone else, including a
          taxing authority, even where we link to it.
        </p>
      </>
    ),
  },
  {
    id: 'information-we-collect',
    title: 'Information we collect',
    body: (
      <>
        <p>We collect three kinds of information, and no more than the service actually needs.</p>
        <p>
          <strong className="font-semibold text-ink">Information you give us directly.</strong>{' '}
          Account details such as a name, email address and role. Messages you send us, including
          anything you choose to put in them.
        </p>
        <p>
          <strong className="font-semibold text-ink">
            Tax return information, given by you or by your preparer.
          </strong>{' '}
          Identifiers for the filer, a spouse and dependants; income, deduction and credit figures;
          bank details where a direct deposit or electronic payment is requested; uploaded source
          documents; and the signatures and authorizations that permit a return to be filed.
        </p>
        <p>
          <strong className="font-semibold text-ink">Technical information.</strong> Server logs
          recording requests to the service, including IP address, timestamp, and the page or
          endpoint requested, kept for security monitoring and troubleshooting. Application access
          logs recording which signed-in user viewed or changed which record, which exist so that a
          practice can answer the question &ldquo;who has seen this file&rdquo;.
        </p>
        <p>
          We do not use advertising pixels, third-party analytics tags, session-replay tools or
          fingerprinting scripts. Typefaces are served from our own infrastructure, so visiting this
          site does not disclose your visit to a font provider.
        </p>
      </>
    ),
  },
  {
    id: 'tax-return-information',
    title: 'Tax return information receives special treatment',
    body: (
      <>
        <p>
          Federal law places specific limits on what a tax return preparer may do with tax return
          information. In general, using or disclosing that information for any purpose other than
          preparing the return requires a separate, specific, written and informed consent from the
          taxpayer, given before the use or disclosure occurs.
        </p>
        <p>
          We treat all return information — the figures, the documents, and the identifiers — as
          falling within that standard, and we do not rely on general agreement to this policy as
          consent for anything of the kind. If we ever need such a consent, we will ask for it
          plainly, on its own, and it will be refusable without losing access to the service.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How we use information',
    body: (
      <>
        <p>We use the information described above to:</p>
        <List
          items={[
            'prepare, review, transmit and keep a record of tax returns;',
            'operate the service — authenticate users, maintain sessions, deliver documents, send transactional notices such as a document request or a filing status change;',
            'run the diagnostics that check a return before it is filed;',
            'keep the service secure, investigate suspected misuse, and satisfy record-retention obligations;',
            'answer messages you send us; and',
            'improve reliability using aggregate, non-identifying operational measurements such as error rates and response times.',
          ]}
        />
        <p>
          We do not use client documents or return figures to train machine-learning models. We do
          not sell, rent or otherwise make personal information available for anyone else&rsquo;s
          marketing.
        </p>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'When information is shared',
    body: (
      <>
        <p>Information leaves our systems in a small number of defined circumstances.</p>
        <p>
          <strong className="font-semibold text-ink">Taxing authorities.</strong> A completed return
          is transmitted to the relevant federal, state or local authority when it has been
          authorized for filing.
        </p>
        <p>
          <strong className="font-semibold text-ink">Service providers.</strong> We use a small set
          of providers for cloud hosting and database, object storage for documents, transactional
          email, and the channel that carries an electronic filing. They act on our instructions
          under contract and may not use the information for their own purposes. A current list is
          available on request.
        </p>
        <p>
          <strong className="font-semibold text-ink">Within your practice.</strong> Where a practice
          uses the service, its administrators, assigned preparers and reviewers see the records
          their role permits, as described on our{' '}
          <TextLink href="/security">security page</TextLink>.
        </p>
        <p>
          <strong className="font-semibold text-ink">Legal process.</strong> Where a valid legal
          obligation requires disclosure. Where we are permitted to tell you that it has happened,
          we will.
        </p>
        <p>
          <strong className="font-semibold text-ink">A change of ownership.</strong> If the business
          or the service is transferred, information may transfer with it, subject to the same
          commitments as this policy — and, for tax return information, subject to the consent rules
          described in section 3.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'How information is protected',
    body: (
      <>
        <p>
          Connections are encrypted in transit, documents and databases are encrypted at rest,
          access is limited by role, identifiers are masked to their last four digits everywhere in
          the interface, and reads as well as writes are recorded in an access log.
        </p>
        <p>
          The mechanisms are described in detail — including the ones we deliberately do not claim —
          on our <TextLink href="/security">security and privacy page</TextLink>. No system is
          perfectly secure, and we do not claim otherwise.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long information is kept',
    body: (
      <>
        <p>
          Tax records are subject to retention obligations that fall on preparers and on taxpayers,
          and those obligations outlast most people&rsquo;s wish to have a record deleted. A
          practice therefore sets a retention period for completed returns and their source
          documents within the limits those obligations impose, and records are purged on a schedule
          once the period elapses.
        </p>
        <p>
          Account records are kept while the account is active and for a reasonable period
          afterwards. Server logs are kept for a short operational window. Access logs are kept for
          as long as the records they describe, because an audit trail that expires before the
          record it documents is not an audit trail.
        </p>
        <p>
          Deletion removes information from live systems promptly; encrypted backups are not
          surgically edited, and deleted records fall out of them as those backups age out of their
          rotation.
        </p>
      </>
    ),
  },
  {
    id: 'your-choices',
    title: 'Your choices and rights',
    body: (
      <>
        <p>
          You can ask us for a copy of the personal information we hold about you, ask us to correct
          it if it is wrong, ask us to delete it, or ask us to explain where it came from. Write to{' '}
          <TextLink href={CONTACT_MAILTO}>{CONTACT_EMAIL}</TextLink> and we will respond.
        </p>
        <p>
          Two honest limits. First, where a retention obligation applies, we may not be able to
          delete a record even if we would like to — we will say so and explain why. Second, where
          your information sits inside a practice&rsquo;s account, we will route the request to that
          practice rather than acting on their records unilaterally.
        </p>
        <p>
          Privacy rights vary by state and are changing. Where a law that applies to you grants a
          right beyond what is described here, we will honour it; we would rather do that than
          publish a list of statutes that goes stale.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and local storage',
    body: (
      <>
        <p>
          The service uses a session cookie to keep you signed in. It is strictly necessary — the
          service cannot work without it — and it carries no advertising or tracking function.
        </p>
        <p>
          Your light or dark theme choice is stored in your own browser under the key{' '}
          <Token>gt-theme</Token>. It never reaches our servers and identifies nothing about you.
        </p>
        <p>
          There are no advertising cookies, no cross-site tracking cookies and no third-party
          analytics cookies on this site, which is why you are not being asked to dismiss a banner.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    body: (
      <>
        <p>
          The service is intended for adults. We do not knowingly create accounts for children.
          Information about a child does appear in tax returns — a dependant has a name, a date of
          birth and an identifier — and that information is provided by the adult preparing the
          return and is protected exactly as the rest of the return is.
        </p>
      </>
    ),
  },
  {
    id: 'where-we-operate',
    title: 'Where information is held',
    body: (
      <>
        <p>
          The service is operated for taxpayers and practices in the United States, and personal
          information is stored on infrastructure located in the United States. We do not offer the
          service to people outside the United States, and we do not routinely transfer personal
          information abroad.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <>
        <p>
          When this policy changes we will update the date at the top of the page. If a change
          materially affects how we use information that we already hold, we will tell affected
          users directly rather than relying on you to notice a new date.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'How to reach us',
    body: (
      <>
        <p>
          Questions about this policy, or a request about your own information, should go to{' '}
          <TextLink href={CONTACT_MAILTO}>{CONTACT_EMAIL}</TextLink>. Putting &ldquo;Privacy&rdquo;
          in the subject line will get it to the right person sooner.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        lead="What we collect, why we collect it, who else sees it, and how long it stays. Written to be read rather than to be defensible in isolation."
        meta={`Last updated ${LAST_UPDATED}`}
      />

      <LegalDocument
        sections={SECTIONS}
        preamble={
          <>
            <Callout tone="warning" title="Status of this document">
              This policy is a working draft published alongside a product that is not yet in
              general release. It is subject to legal review before production launch, and it may
              change as a result. We are publishing it now because a company that will not say how
              it handles data until a lawyer has polished the sentence is telling you something.
            </Callout>
            <p>
              The short version, which the sections below expand rather than replace: we collect
              what preparing a tax return requires and very little else. We do not sell it, share it
              for anyone&rsquo;s marketing, or train models on it. Tax return information is subject
              to a stricter federal standard than ordinary personal data, and we treat it that way.
              Where we cannot do something you ask — usually because a records obligation stops us —
              we will say so rather than go quiet.
            </p>
          </>
        }
        postscript={
          <p className="text-sm text-ink-subtle">
            This document describes practice, not aspiration. If you find a place where the site or
            the software behaves differently from what is written here, that is a defect and we want
            to hear about it at <TextLink href={CONTACT_MAILTO}>{CONTACT_EMAIL}</TextLink>.
          </p>
        }
      />
    </>
  );
}
