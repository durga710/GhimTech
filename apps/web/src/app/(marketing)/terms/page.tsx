import type { Metadata } from 'next';
import { TextLink } from '@/components/ui/button';
import { Callout } from '@/components/ui/surface';
import { PageHero } from '@/components/marketing/page-hero';
import { LegalDocument, type LegalSection } from '@/components/marketing/legal-document';
import { List } from '@/components/marketing/prose';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/components/marketing/site-contact';

const description =
  'The terms on which the GhimTech Tax website and software may be used: what the software is and is not, who is responsible for a return, what we do not guarantee, and how the agreement can end.';

const LAST_UPDATED = '1 August 2026';

export const metadata: Metadata = {
  title: 'Terms of use',
  description,
  alternates: { canonical: '/terms' },
  openGraph: {
    type: 'website',
    url: '/terms',
    title: 'Terms of use · GhimTech Tax',
    description,
  },
};

const SECTIONS: LegalSection[] = [
  {
    id: 'agreement',
    title: 'The agreement',
    body: (
      <>
        <p>
          These terms govern your use of the GhimTech Tax website and of the GhimTech Tax software
          (together, the &ldquo;service&rdquo;), which are provided by GhimTech (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;). By using the service you agree to them.
        </p>
        <p>
          Where a tax practice has a separate written agreement with us, that agreement governs its
          use of the software and these terms fill the gaps rather than override it.
        </p>
        <p>
          Our <TextLink href="/privacy">privacy policy</TextLink> forms part of this agreement and
          describes how information is handled.
        </p>
      </>
    ),
  },
  {
    id: 'what-the-service-is',
    title: 'What the service is — and is not',
    body: (
      <>
        <p>
          The service is software for preparing, reviewing and filing tax returns. It performs
          calculations, applies rules, raises diagnostics, stores documents, and transmits an
          authorized return to the relevant taxing authority.
        </p>
        <p>
          It is not tax advice, legal advice, or financial advice, and using it does not create a
          professional relationship between you and us. The pages on this site describing forms,
          schedules and Pennsylvania rules are general information; they are not a determination
          about any particular return.
        </p>
        <p>
          A return prepared with this software is prepared by a person — you, or the practice acting
          for you. The software is a tool that person uses, in the way a calculator is a tool. The
          responsibility for what the return says rests with the person who signs it.
        </p>
      </>
    ),
  },
  {
    id: 'eligibility',
    title: 'Eligibility and accounts',
    body: (
      <>
        <p>
          You must be at least eighteen years old and legally able to enter into this agreement. The
          service is offered in the United States only.
        </p>
        <p>
          Accounts are personal. You are responsible for keeping your credentials confidential, for
          everything done under your account, and for telling us promptly if you believe your
          account has been used without your authorization. Sharing a login with a colleague is not
          permitted — it defeats the access logging the service depends on, and it is the single
          fastest way to make an audit trail worthless.
        </p>
        <p>
          Practice administrators are responsible for the accounts they create, for the roles they
          assign, and for removing access when someone leaves.
        </p>
      </>
    ),
  },
  {
    id: 'your-responsibilities',
    title: 'Your responsibilities',
    body: (
      <>
        <p>You agree to:</p>
        <List
          items={[
            'provide accurate and complete information, and to correct it when you learn it was wrong;',
            'review a return before authorizing it for filing, including any diagnostics raised against it;',
            'keep your own copies of the documents and records you are obliged to retain;',
            'use the service only for lawful purposes and only for returns you are entitled to prepare; and',
            'comply with the professional obligations that apply to you, if you prepare returns for others.',
          ]}
        />
        <p>
          The software will tell you when something looks wrong. It cannot tell you about a document
          you never uploaded or a fact you did not disclose.
        </p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    body: (
      <>
        <p>You must not:</p>
        <List
          items={[
            'attempt to access an account, a practice, or a record that you are not authorized to access;',
            'interfere with the operation, integrity or security of the service, or probe it in a way that degrades it for others;',
            'reverse engineer, scrape, resell or redistribute the service or any part of it, except where that restriction is unenforceable by law;',
            'upload malicious code, or content you have no right to upload;',
            'use the service to prepare a return you know to be false, or to facilitate identity theft or refund fraud; or',
            'use the service to build a competing product.',
          ]}
        />
        <p>
          Good-faith security research is welcome and is governed by the disclosure position on our{' '}
          <TextLink href="/security">security page</TextLink> rather than by this clause.
        </p>
      </>
    ),
  },
  {
    id: 'no-guarantees',
    title: 'What we do not guarantee',
    body: (
      <>
        <p>This section is short and deliberately blunt.</p>
        <p>
          We do not guarantee that a return will be accepted for electronic filing. Acceptance is a
          decision made by the taxing authority, on its own systems, for its own reasons.
        </p>
        <p>
          We do not guarantee the amount of any refund, the timing of any refund, or that a refund
          will be paid at all.
        </p>
        <p>
          We do not guarantee that a return prepared with the service will not be examined,
          adjusted, or assessed additional tax, interest or penalties. No software can protect a
          return from examination, and any product claiming otherwise is misdescribing itself.
        </p>
        <p>
          We hold no certification, accreditation or third-party attestation other than any we have
          actually been granted, and we make no claim to one anywhere on this site.
        </p>
      </>
    ),
  },
  {
    id: 'fees',
    title: 'Fees',
    body: (
      <>
        <p>
          Where the service is offered for a fee, the fee, the billing period and the payment terms
          will be stated before you are charged, in the ordering document or the plan description
          that applies to you. We will not introduce a charge partway through a return, and we will
          not reveal a fee only at the point of filing.
        </p>
        <p>
          Taxes and third-party charges, where they apply, are your responsibility unless we state
          otherwise.
        </p>
      </>
    ),
  },
  {
    id: 'your-content',
    title: 'Your data and your documents',
    body: (
      <>
        <p>
          You keep ownership of the information and documents you put into the service. You grant us
          only the permission needed to host, process, transmit and back up that material in order
          to provide the service — nothing broader, and nothing that would allow us to use it for
          another purpose.
        </p>
        <p>
          Tax return information is additionally subject to the federal consent rules described in
          our <TextLink href="/privacy">privacy policy</TextLink>.
        </p>
      </>
    ),
  },
  {
    id: 'our-content',
    title: 'Our intellectual property',
    body: (
      <>
        <p>
          The service, its software, its interface, its design system and its documentation belong
          to us and are protected by intellectual property law. Using the service does not transfer
          any of that to you. Tax forms and government publications are, of course, not ours.
        </p>
      </>
    ),
  },
  {
    id: 'third-parties',
    title: 'Third parties and taxing authorities',
    body: (
      <>
        <p>
          The service depends on infrastructure providers and on the electronic filing channels
          operated by taxing authorities. We are not responsible for the availability or the
          decisions of a taxing authority, and an outage on their side can prevent a filing from
          being transmitted or acknowledged through no fault of either of us.
        </p>
      </>
    ),
  },
  {
    id: 'availability',
    title: 'Availability and changes to the service',
    body: (
      <>
        <p>
          We aim to keep the service available and to schedule maintenance outside the hours when a
          preparer is most likely to need it. We do not promise uninterrupted availability, and we
          are not able to promise it honestly.
        </p>
        <p>
          We may add, change or remove features. Where a change materially reduces functionality you
          rely on, we will give reasonable notice.
        </p>
      </>
    ),
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers',
    body: (
      <>
        <p>
          To the fullest extent permitted by law, the service is provided &ldquo;as is&rdquo; and
          &ldquo;as available&rdquo;, without warranties of any kind, whether express or implied,
          including implied warranties of merchantability, fitness for a particular purpose,
          accuracy, and non-infringement.
        </p>
        <p>
          Some jurisdictions do not allow the exclusion of certain warranties, in which case the
          exclusions above apply only to the extent permitted.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    body: (
      <>
        <p>
          To the fullest extent permitted by law, neither party is liable for indirect, incidental,
          special, consequential or punitive damages, or for lost profits, lost revenue or lost
          data, arising out of or relating to the service.
        </p>
        <p>
          Our total liability arising out of or relating to the service is limited to the amount you
          paid us for the service in the twelve months before the event giving rise to the claim.
        </p>
        <p>
          Nothing in these terms limits liability that cannot be limited by law, including liability
          for fraud.
        </p>
      </>
    ),
  },
  {
    id: 'indemnity',
    title: 'Indemnity',
    body: (
      <>
        <p>
          You agree to indemnify us against claims, losses and reasonable costs arising from your
          use of the service in breach of these terms, from information you provided that was false,
          or from returns you prepared for others.
        </p>
      </>
    ),
  },
  {
    id: 'termination',
    title: 'Suspension and termination',
    body: (
      <>
        <p>
          You may stop using the service at any time. We may suspend or terminate access if these
          terms are breached, if there is a credible security or fraud concern, or if we are
          required to by law.
        </p>
        <p>
          Before an account is closed we will make your records available for export, because tax
          records carry retention obligations and nobody should lose them because a subscription
          lapsed. Clauses that by their nature should survive termination — ownership, disclaimers,
          liability, governing law — do survive it.
        </p>
      </>
    ),
  },
  {
    id: 'governing-law',
    title: 'Governing law',
    body: (
      <>
        <p>
          These terms are governed by the laws of the Commonwealth of Pennsylvania and the
          applicable laws of the United States, without regard to conflict of law rules. Disputes
          will be brought in the courts located in the Commonwealth of Pennsylvania, and both
          parties consent to that jurisdiction.
        </p>
      </>
    ),
  },
  {
    id: 'general',
    title: 'General',
    body: (
      <>
        <p>
          If any provision is found unenforceable, the rest remains in force. A failure to enforce a
          provision is not a waiver of it. You may not assign this agreement without our consent; we
          may assign it in connection with a transfer of the business.
        </p>
        <p>
          We may update these terms. When we do we will change the date at the top of this page, and
          for material changes we will give notice through the service before they take effect.
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
          Questions about these terms should go to{' '}
          <TextLink href={CONTACT_MAILTO}>{CONTACT_EMAIL}</TextLink>.
        </p>
      </>
    ),
  },
];

export default function TermsPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of use"
        lead="What the software is, what it is not, who is responsible for a return, and what we will not pretend to guarantee."
        meta={`Last updated ${LAST_UPDATED}`}
      />

      <LegalDocument
        sections={SECTIONS}
        preamble={
          <>
            <Callout tone="warning" title="Status of this document">
              These terms are a working draft published alongside a product that is not yet in
              general release. They are subject to legal review before production launch and may
              change as a result. They are published now so that anyone evaluating the software can
              see what we are prepared to commit to before they ask.
            </Callout>
            <p>
              Section 6 is the one worth reading before the others. It sets out, in plain terms, the
              things we do not guarantee — acceptance of a filing, the size or timing of a refund,
              freedom from examination — because those are exactly the promises this industry is
              most tempted to make.
            </p>
          </>
        }
        postscript={
          <p className="text-sm text-ink-subtle">
            If a clause here is unclear, ask us at{' '}
            <TextLink href={CONTACT_MAILTO}>{CONTACT_EMAIL}</TextLink>. A term that only makes sense
            to the party who wrote it is not doing its job.
          </p>
        }
      />
    </>
  );
}
