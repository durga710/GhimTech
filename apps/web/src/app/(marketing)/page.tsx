import type { Metadata } from 'next';
import { ButtonLink, TextLink } from '@/components/ui/button';
import { Badge, Eyebrow, Panel, PanelBody, PanelHeader } from '@/components/ui/surface';
import {
  BandHeading,
  CheckList,
  CtaBand,
  DefinitionTable,
  FaqList,
  HairlineCell,
  HairlineGrid,
  Section,
  StageRail,
} from '@/components/site/marketing';
import {
  DiagnosticsPreview,
  DocumentReviewPreview,
  FilingTimelinePreview,
  PortalPreview,
  ReturnWorkspacePreview,
} from '@/components/site/interface-preview';

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://tax.ghimtech.org';

export const metadata: Metadata = {
  title: 'Federal and Pennsylvania tax preparation software',
  description:
    'GhimTech Tax prepares Federal and Pennsylvania returns from one file: guided intake, documents matched to the fields they feed, diagnostics that run while you work, electronic authorization, e-file and a client portal.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'GhimTech Tax — Federal and Pennsylvania tax preparation',
    description:
      'Preparation software for a practice that files Form 1040 and PA-40. Intake, documents, diagnostics, authorization, e-file, and a portal the taxpayer will actually use.',
  },
};

/*
 * Structured data. Organization and SoftwareApplication only — no rating and no
 * review node, because there is nothing to cite for either and search results
 * are not the place to start inventing social proof.
 */
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'GhimTech',
      url: 'https://ghimtech.org',
      description: 'A software company building professional tools, including GhimTech Tax.',
      brand: { '@type': 'Brand', name: 'GhimTech Tax' },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: 'GhimTech Tax',
      url: SITE_URL,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Tax preparation',
      operatingSystem: 'Web browser',
      publisher: { '@id': `${SITE_URL}/#organization` },
      description:
        'Federal and Pennsylvania tax preparation software for professional practices, with guided intake, document review, pre-filing diagnostics, electronic authorization, e-file and a client portal.',
      featureList: [
        'Guided taxpayer intake',
        'Source document review and matching',
        'Federal Form 1040 preparation',
        'Pennsylvania PA-40 and local earned income tax preparation',
        'Pre-filing diagnostics with severity ranking',
        'Electronic authorization for Form 8879',
        'Electronic filing and rejection handling',
        'Client portal for taxpayers',
        'Practice reporting',
      ],
    },
  ],
};

const HERO_SPECS: readonly string[] = [
  'Form 1040',
  'PA-40',
  'Schedules A–SE',
  'PA local EIT',
  'Form 8879',
];

const WORKFLOW_STAGES = [
  {
    ordinal: '01',
    title: 'Intake',
    summary: 'The taxpayer answers a guided questionnaire that adapts to what they tell you.',
  },
  {
    ordinal: '02',
    title: 'Documents',
    summary: 'Sources arrive, are read, and are matched to the fields they feed.',
  },
  {
    ordinal: '03',
    title: 'Preparation',
    summary: 'Federal and Pennsylvania are built from the same file, with diagnostics running.',
  },
  {
    ordinal: '04',
    title: 'Review and signature',
    summary: 'A second set of eyes, then the taxpayer authorizes the return electronically.',
  },
  {
    ordinal: '05',
    title: 'Filing',
    summary: 'Transmit, track the acknowledgement, and correct anything that comes back.',
  },
] as const;

const FEDERAL_FORMS = [
  {
    term: 'Form 1040',
    detail: 'The return, with the filing status and dependent logic behind it.',
  },
  { term: 'Schedules 1–3', detail: 'Additional income, adjustments, credits and other taxes.' },
  { term: 'Schedule A', detail: 'Itemized deductions, tested against the standard deduction.' },
  { term: 'Schedules B and D', detail: 'Interest and dividends; capital gains and losses.' },
  { term: 'Schedules C, E, SE', detail: 'Sole proprietorships, rentals and self-employment tax.' },
  {
    term: 'Schedule 8812, EIC',
    detail: 'Child Tax Credit and Earned Income Credit, with their eligibility tests.',
  },
] as const;

const PENNSYLVANIA_FORMS = [
  { term: 'PA-40', detail: 'The Pennsylvania personal income tax return.' },
  {
    term: 'PA schedules',
    detail: 'A, B, D, UE, C and E, and the compensation schedules that feed them.',
  },
  { term: 'PA Schedule SP', detail: 'Tax forgiveness, with the eligibility income calculation.' },
  {
    term: 'Local EIT',
    detail: 'The municipal earned income tax return your collector requires.',
  },
  { term: 'PA-40 ES', detail: 'Estimated payments, carried forward into next season.' },
  {
    term: 'Residency',
    detail: 'Resident, part-year and nonresident treatment of the same income.',
  },
] as const;

const SECURITY_MECHANISMS: readonly string[] = [
  'Documents and return data are encrypted in transit and at rest.',
  'Every view, download and change is written to an audit history with the user, the record and the time.',
  'Access is granted per role — a preparer sees their assignments, a reviewer sees the review queue, an administrator sees the practice.',
  'Identifiers are masked in the interface by default and revealed only where the field requires them.',
  'Sign-in supports a second factor, and sessions expire rather than lingering on a shared machine.',
  'Retention and deletion are set by the practice, and a deletion removes the document rather than hiding it.',
];

const FAQ_ITEMS = [
  {
    question: 'Who is GhimTech Tax for?',
    answer:
      'Tax professionals who prepare individual Federal and Pennsylvania returns, and the taxpayers those professionals serve. The preparer works in the workspace; the taxpayer works in the portal. Both are looking at the same return.',
  },
  {
    question: 'Does it file the return for me?',
    answer:
      'It prepares the return, runs diagnostics against it, collects the taxpayer’s electronic authorization and transmits the submission, then tracks the acknowledgement and reopens the return if the submission is rejected. The professional decides what is filed and when.',
  },
  {
    question: 'What happens when a return is rejected?',
    answer:
      'The rejection comes back with the reason the agency gave. GhimTech Tax attaches it to the submission, reopens the return at the field responsible where it can identify one, and keeps the earlier transmission in the history so the correction is visible rather than silent.',
  },
  {
    question: 'How is Pennsylvania handled?',
    answer:
      'Pennsylvania is prepared from the same file as the federal return rather than re-keyed into a second product. Compensation, business income and residency carry across with Pennsylvania’s own treatment applied, and the local earned income tax return follows from the same addresses.',
  },
  {
    question: 'What does the taxpayer have to do?',
    answer:
      'Answer the intake questions, upload documents, review the return, and sign the authorization. The portal tells them what is outstanding and what has already been received, which is most of what a season’s worth of phone calls is about.',
  },
  {
    question: 'Where is our data held, and who can see it?',
    answer: (
      <>
        Return data and documents are encrypted in transit and at rest, access is scoped to the role
        a user holds, and every access is logged. The mechanisms are described in full on the{' '}
        <TextLink href="/security">security and privacy</TextLink> page.
      </>
    ),
  },
] as const;

export default function HomePage(): React.JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-canvas">
        <div className="rail rail-wide py-14 md:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] lg:gap-16">
            <div>
              <Eyebrow>Federal and Pennsylvania · Tax year 2025</Eyebrow>

              <h1 className="mt-6 font-display text-h1 font-normal text-ink">
                Prepare the return with the whole file in front of you.
              </h1>

              <p className="mt-6 max-w-xl text-lead text-ink-muted">
                GhimTech Tax is preparation software for a practice that files Form 1040 and PA-40.
                Guided intake, source documents matched to the fields they feed, diagnostics running
                while you work, and a portal that keeps the taxpayer moving instead of waiting on a
                phone call.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/product" size="lg">
                  See what it does
                </ButtonLink>
                <ButtonLink href="/how-it-works" size="lg" variant="secondary">
                  How it works
                </ButtonLink>
              </div>

              <ul className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-line-subtle pt-6">
                {HERO_SPECS.map((spec) => (
                  <li key={spec} className="font-mono text-micro tabular text-ink-subtle">
                    {spec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:pl-4">
              <ReturnWorkspacePreview />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Positioning                                                         */}
      {/* ------------------------------------------------------------------ */}
      <Section tone="alt" wide>
        <HairlineGrid columns={3}>
          <HairlineCell level={2} title="One file, two jurisdictions">
            Federal and Pennsylvania are prepared from the same record. Nothing is re-keyed into a
            second product, so nothing drifts between them.
          </HairlineCell>
          <HairlineCell level={2} title="Findings before transmission">
            Diagnostics run continuously and rank what they find, so anything that would be rejected
            is dealt with before a submission is ever built.
          </HairlineCell>
          <HairlineCell level={2} title="A portal the taxpayer will use">
            One short list of what is outstanding, in plain language, with a place to upload it and
            a signature at the end.
          </HairlineCell>
        </HairlineGrid>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Diagnostics                                                         */}
      {/* ------------------------------------------------------------------ */}
      <Section id="diagnostics" wide>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
          <div>
            <BandHeading
              eyebrow="Diagnostics"
              title="Every finding, ranked by what it will actually cost you."
              lead="A rejection found in March costs a transmission cycle and a phone call. The same defect found while the return is open costs thirty seconds."
            />
            <CheckList
              className="mt-8"
              items={[
                'Four severities, distinguishable without relying on colour alone.',
                'Rejects and errors lock transmission until they are cleared or explained.',
                'Each finding names the field, the form and the resolution.',
                'Where a finding anticipates an e-file business rule, the rule is cited.',
                'Advisory notes surface elections worth considering, and never block.',
              ]}
            />
            <p className="mt-8">
              <TextLink href="/product#diagnostics" className="inline-flex min-h-10 items-center">
                See how diagnostics are built
              </TextLink>
            </p>
          </div>

          <DiagnosticsPreview />
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Workflow                                                            */}
      {/* ------------------------------------------------------------------ */}
      <Section id="workflow" tone="alt" wide>
        <BandHeading
          eyebrow="The workflow"
          title="Five stages, from a new client to an acknowledgement."
          lead="The same five stages govern the preparer's workspace and the taxpayer's portal, so both sides of a return always agree on where it stands."
        />
        <StageRail className="mt-10" stages={WORKFLOW_STAGES} />
        <p className="mt-8">
          <TextLink href="/how-it-works" className="inline-flex min-h-10 items-center">
            Walk through all five stages
          </TextLink>
        </p>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Federal and Pennsylvania                                            */}
      {/* ------------------------------------------------------------------ */}
      <Section id="federal-and-pennsylvania" wide>
        <BandHeading
          eyebrow="Coverage"
          title="Federal and Pennsylvania, prepared together."
          lead="Pennsylvania is not a federal return with a different cover page. Compensation, business income, residency and tax forgiveness each follow their own rules, and the software applies them from the same underlying file."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Panel>
            <PanelHeader
              title="Federal"
              description="Form 1040 and the schedules an individual return reaches for."
              actions={<Badge tone="neutral">Tax year 2025</Badge>}
            />
            <PanelBody>
              <DefinitionTable items={FEDERAL_FORMS} />
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader
              title="Pennsylvania"
              description="PA-40, its schedules, and the local return that follows from them."
              actions={<Badge tone="accent">Same file</Badge>}
            />
            <PanelBody>
              <DefinitionTable items={PENNSYLVANIA_FORMS} />
            </PanelBody>
          </Panel>
        </div>

        <p className="mt-8 text-sm text-ink-subtle">
          Coverage is set out in full under{' '}
          <TextLink href="/supported-tax-situations">supported tax situations</TextLink> and{' '}
          <TextLink href="/federal-and-pennsylvania">Federal and Pennsylvania</TextLink>. Situations
          the software does not handle are listed there as plainly as the ones it does.
        </p>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Documents                                                           */}
      {/* ------------------------------------------------------------------ */}
      <Section id="documents" tone="alt" wide>
        <BandHeading
          eyebrow="Documents"
          title="A source document is only useful once it reaches a field."
          lead="Uploads are read, matched to the return, and put in front of the preparer beside the fields they feed — so confirming a W-2 means looking at the W-2, not at a filename."
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
          <DocumentReviewPreview />

          <div className="lg:pt-2">
            <h3 className="text-h3 font-semibold text-ink">How a document is handled</h3>
            <CheckList
              className="mt-5"
              items={[
                'The taxpayer photographs or uploads it from the portal, on a phone or a desktop.',
                'It is encrypted on arrival and stored encrypted.',
                'It is identified by type and attached to the return it belongs to.',
                'Values are proposed, never posted silently — a preparer confirms each one.',
                'Anything still outstanding stays on the taxpayer’s list until it arrives.',
              ]}
            />
            <p className="mt-6">
              <TextLink href="/security" className="inline-flex min-h-10 items-center">
                How documents are protected
              </TextLink>
            </p>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Filing                                                              */}
      {/* ------------------------------------------------------------------ */}
      <Section id="filing" wide>
        <BandHeading
          eyebrow="Electronic filing"
          title="What happens between “file” and “accepted”."
          lead="Electronic filing is a conversation with an agency, not a button. The software makes each turn of that conversation visible, including the ones that go badly."
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <FilingTimelinePreview />

          <div>
            <ol className="flex flex-col gap-6">
              <li>
                <h3 className="text-ui font-semibold text-ink">1 · Clear the diagnostics</h3>
                <p className="mt-1.5 text-sm text-ink-muted">
                  A submission cannot be built while a reject or an error is open. Advisory findings
                  can be acknowledged and left.
                </p>
              </li>
              <li>
                <h3 className="text-ui font-semibold text-ink">2 · Collect the authorization</h3>
                <p className="mt-1.5 text-sm text-ink-muted">
                  The taxpayer reviews the return and signs Form 8879 electronically. Both spouses
                  sign on a joint return, and the signed record is retained with the return.
                </p>
              </li>
              <li>
                <h3 className="text-ui font-semibold text-ink">3 · Transmit</h3>
                <p className="mt-1.5 text-sm text-ink-muted">
                  The federal return and the PA-40 are assembled and sent, and the submission is
                  stamped with what was sent and when.
                </p>
              </li>
              <li>
                <h3 className="text-ui font-semibold text-ink">4 · Read the acknowledgement</h3>
                <p className="mt-1.5 text-sm text-ink-muted">
                  Acceptance closes the return. A rejection reopens it with the agency’s reason
                  attached, and the corrected return is retransmitted as a new submission against
                  the same history.
                </p>
              </li>
            </ol>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Client portal                                                       */}
      {/* ------------------------------------------------------------------ */}
      <Section id="portal" tone="alt" wide>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
          <div>
            <BandHeading
              eyebrow="Client portal"
              title="The taxpayer sees the same return, in their own words."
              lead="Most of a filing season's friction is a taxpayer who does not know what is outstanding. The portal answers that question on one screen, and keeps answering it as things change."
            />
            <CheckList
              className="mt-8"
              items={[
                'A short list of what is still needed, written in plain language.',
                'Upload from a phone camera or a desktop file picker.',
                'The prepared return to read before anything is signed.',
                'Electronic signature for the filing authorization.',
                'Filing status, from transmission to acknowledgement.',
              ]}
            />
          </div>

          <div className="mx-auto w-full max-w-md lg:max-w-lg">
            <PortalPreview />
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Trust                                                               */}
      {/* ------------------------------------------------------------------ */}
      <Section id="trust" wide>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
          <BandHeading
            eyebrow="Trust and privacy"
            title="What we can tell you about how your data is held."
            lead="A tax file is one of the most sensitive records a person owns. Rather than a badge, here is the mechanism — what is encrypted, what is logged, and who can reach it."
          />

          <div>
            <CheckList items={SECURITY_MECHANISMS} />
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-1">
              <TextLink href="/security" className="inline-flex min-h-10 items-center">
                Security and privacy
              </TextLink>
              <TextLink href="/privacy" className="inline-flex min-h-10 items-center">
                Privacy policy
              </TextLink>
              <TextLink href="/accessibility" className="inline-flex min-h-10 items-center">
                Accessibility statement
              </TextLink>
            </div>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* FAQ                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <Section id="faq" tone="alt">
        <BandHeading eyebrow="Questions" title="Before you go further." />
        <FaqList className="mt-10" items={FAQ_ITEMS} />
      </Section>

      <CtaBand
        title="Look at the product before you decide anything."
        lead="The overview walks through every part of the software, and the workflow page follows a single return from intake to acknowledgement."
        primary={{ label: 'Product overview', href: '/product' }}
        secondary={{ label: 'Talk to us', href: '/contact' }}
      />
    </>
  );
}
