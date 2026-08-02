import type { Metadata } from 'next';
import Link from 'next/link';
import { TextLink } from '@/components/ui/button';
import { Callout, Eyebrow, Panel, PanelBody, PanelHeader } from '@/components/ui/surface';
import {
  BandHeading,
  CheckList,
  CtaBand,
  DefinitionTable,
  HairlineCell,
  HairlineGrid,
  Section,
} from '@/components/site/marketing';
import {
  DiagnosticsPreview,
  DocumentReviewPreview,
  FilingTimelinePreview,
  PortalPreview,
  ReturnWorkspacePreview,
} from '@/components/site/interface-preview';

export const metadata: Metadata = {
  title: 'Product overview',
  description:
    'What each part of GhimTech Tax does: intake, document handling, Federal preparation, Pennsylvania preparation, diagnostics, review, electronic authorization, e-file and rejection handling, the client portal, and practice reporting.',
  alternates: { canonical: '/product' },
  openGraph: {
    type: 'website',
    url: '/product',
    title: 'Product overview — GhimTech Tax',
    description:
      'Intake, documents, Federal and Pennsylvania preparation, diagnostics, review, electronic authorization, e-file and rejection handling, the client portal, and reporting.',
  },
};

const MODULES: readonly { id: string; label: string }[] = [
  { id: 'intake', label: 'Intake' },
  { id: 'documents', label: 'Document handling' },
  { id: 'federal', label: 'Federal preparation' },
  { id: 'pennsylvania', label: 'Pennsylvania preparation' },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'review', label: 'Review' },
  { id: 'authorization', label: 'Electronic authorization' },
  { id: 'filing', label: 'E-file and rejections' },
  { id: 'portal', label: 'Client portal' },
  { id: 'reporting', label: 'Reporting' },
];

const INTAKE_RECORDS = [
  {
    term: 'Identity',
    detail: 'Names, identification numbers, dates of birth, Identity Protection PINs.',
  },
  { term: 'Household', detail: 'Filing status, spouse, dependents, months lived in the home.' },
  {
    term: 'Addresses',
    detail: 'The mailing address, and the Pennsylvania municipality that governs the local return.',
  },
  {
    term: 'Income sources',
    detail: 'What the taxpayer expects to receive, so a missing document is known early.',
  },
  {
    term: 'Life events',
    detail: 'A marriage, a birth, a move, a new business, a death in the family.',
  },
  { term: 'Banking', detail: 'Direct deposit or debit details, entered once and confirmed.' },
] as const;

export default function ProductPage(): React.JSX.Element {
  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-canvas">
        <div className="rail rail-wide py-14 md:py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:items-center lg:gap-16">
            <div>
              <Eyebrow>Product overview</Eyebrow>
              <h1 className="mt-6 font-display text-h1 font-normal text-ink">
                Ten parts, one return.
              </h1>
              <p className="mt-6 max-w-xl text-lead text-ink-muted">
                GhimTech Tax is not a form filler with a portal bolted to the side. Every part below
                reads and writes the same return record, which is why a document confirmed in review
                turns up in the diagnostics rail a second later without anyone re-entering it.
              </p>

              <nav aria-label="Sections of this page" className="mt-9">
                <ul className="flex flex-wrap gap-2">
                  {MODULES.map((module) => (
                    <li key={module.id}>
                      <Link
                        href={`#${module.id}`}
                        className="inline-flex min-h-10 items-center rounded-full border border-line-subtle px-3.5 text-sm text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink"
                      >
                        {module.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <ReturnWorkspacePreview />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 1 · Intake                                                          */}
      {/* ------------------------------------------------------------------ */}
      <Section id="intake" tone="alt" wide>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
          <BandHeading
            eyebrow="01 · Intake"
            title="Ask once, and only ask what applies."
            lead="Intake is a conversation that narrows. A taxpayer with no dependents is never shown the dependent questions, and a taxpayer who reports a rental is asked about it before the season gets busy."
          />
          <div>
            <CheckList
              items={[
                'The questionnaire branches on the answers already given, so nobody scrolls past questions that cannot apply to them.',
                'Answers carry forward from last season, presented for confirmation rather than re-keyed.',
                'The taxpayer can stop halfway and resume from any device; nothing is lost between sessions.',
                'Identifiers are validated as they are entered — a number that was never issued is caught at the keyboard, not at transmission.',
                'A preparer can complete intake on the taxpayer’s behalf when the interview happens in the office.',
              ]}
            />
            <div className="mt-10">
              <h3 className="text-h3 font-semibold text-ink">What intake records</h3>
              <DefinitionTable className="mt-4" items={INTAKE_RECORDS} />
            </div>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 2 · Documents                                                       */}
      {/* ------------------------------------------------------------------ */}
      <Section id="documents" wide>
        <BandHeading
          eyebrow="02 · Document handling"
          title="From a photograph on a phone to a confirmed field."
          lead="Documents are the raw material of a return, and the place most of the time goes. The software's job is to shorten the distance between a page arriving and its values being trusted."
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
          <DocumentReviewPreview />
          <div>
            <CheckList
              items={[
                'Upload from the portal or the workspace: camera capture, file picker, or a PDF.',
                'Each document is classified by type and attached to the return and the tax year.',
                'Values read from the page are proposed for confirmation and never written silently.',
                'The document sits beside the field it feeds, so the check is a glance rather than a hunt.',
                'A requested document that has not arrived stays on the taxpayer’s outstanding list.',
                'Every view and download is recorded in the audit history.',
              ]}
            />
            <Callout className="mt-8" tone="neutral" title="On automatic extraction">
              Reading a document is a convenience, not an authority. A proposed value has no effect
              on the return until a preparer confirms it, and the page it came from stays one click
              away for as long as the return is retained.
            </Callout>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 3 · Federal                                                         */}
      {/* ------------------------------------------------------------------ */}
      <Section id="federal" tone="alt" wide>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
          <BandHeading
            eyebrow="03 · Federal preparation"
            title="Form 1040, with the reasoning visible."
            lead="The federal return is built section by section in the navigator. Filing status, dependents, income, adjustments, deductions and credits each carry the tests behind them, so a preparer can see why a figure landed where it did."
          />
          <div>
            <CheckList
              items={[
                'Filing status is tested against the household as recorded, not merely chosen from a list.',
                'Dependent eligibility, the Child Tax Credit and the Earned Income Credit are evaluated against the facts on file.',
                'The itemized total is compared with the standard deduction and the better election is surfaced.',
                'Self-employment income, rentals and capital transactions flow into the right schedules.',
                'Amounts are set in aligned tabular figures, so a mistyped digit breaks the column visibly.',
                'Every computed figure can be traced back to the entries that produced it.',
              ]}
            />
          </div>
        </div>

        <HairlineGrid className="mt-14" columns={3}>
          <HairlineCell index="A" title="Identity and household">
            Names, identification numbers and dependents, checked for the defects that cause a return
            to be refused before a single dollar figure is read.
          </HairlineCell>
          <HairlineCell index="B" title="Income and adjustments">
            Wages, interest, dividends, capital transactions, business and rental income, and the
            adjustments that sit above the line.
          </HairlineCell>
          <HairlineCell index="C" title="Deductions and credits">
            The standard-versus-itemized election, and the credits whose eligibility tests are the
            most common source of a refused return.
          </HairlineCell>
        </HairlineGrid>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 4 · Pennsylvania                                                    */}
      {/* ------------------------------------------------------------------ */}
      <Section id="pennsylvania" wide>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
          <BandHeading
            eyebrow="04 · Pennsylvania preparation"
            title="PA-40 is a different return, not a copy."
            lead="Pennsylvania taxes eight classes of income at a flat rate, allows almost none of the federal deductions, and hands part of the job to the municipality. Preparing it as a derivative of the 1040 is how mistakes get made."
          />
          <div>
            <CheckList
              items={[
                'Compensation is computed under Pennsylvania’s rules rather than carried across from federal wages unchanged.',
                'Unreimbursed business expenses are handled on PA Schedule UE, where Pennsylvania still allows them.',
                'Tax forgiveness on PA Schedule SP is evaluated from eligibility income, which is not federal adjusted gross income.',
                'Resident, part-year resident and nonresident treatment is applied to each class of income.',
                'The local earned income tax return follows from the taxpayer’s municipality and the same wage records.',
                'Estimated payments and prior-year credits carry into the following season.',
              ]}
            />
            <p className="mt-8">
              <TextLink
                href="/federal-and-pennsylvania"
                className="inline-flex min-h-10 items-center"
              >
                The full Federal and Pennsylvania breakdown
              </TextLink>
            </p>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 5 · Diagnostics                                                     */}
      {/* ------------------------------------------------------------------ */}
      <Section id="diagnostics" tone="alt" wide>
        <BandHeading
          eyebrow="05 · Diagnostics"
          title="Four severities, and only two of them stop you."
          lead="A diagnostic that cries wolf is worse than none at all. Each rule declares once what it is, how serious it is, which form it belongs to, and what the preparer should do about it."
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <DiagnosticsPreview />

          <div>
            <dl className="flex flex-col gap-5">
              <div>
                <dt className="text-ui font-semibold text-ink">Reject</dt>
                <dd className="mt-1 text-sm text-ink-muted">
                  The electronic filing gateway will refuse the transmission. Blocking.
                </dd>
              </div>
              <div>
                <dt className="text-ui font-semibold text-ink">Error</dt>
                <dd className="mt-1 text-sm text-ink-muted">
                  The return is internally inconsistent or arithmetically wrong. Blocking.
                </dd>
              </div>
              <div>
                <dt className="text-ui font-semibold text-ink">Warning</dt>
                <dd className="mt-1 text-sm text-ink-muted">
                  A probable data-entry defect. Worth a look before filing; does not block.
                </dd>
              </div>
              <div>
                <dt className="text-ui font-semibold text-ink">Note</dt>
                <dd className="mt-1 text-sm text-ink-muted">
                  An election or an opportunity worth a preparer’s attention. Never blocks.
                </dd>
              </div>
            </dl>

            <Callout className="mt-8" tone="neutral" title="On cited business rules">
              Where a finding anticipates a published e-file business rule, the rule is cited so a
              preparer knows what the gateway is likely to say. Those rule sets are republished and
              renumbered each season, and the citations are reconciled against the current release
              before a season opens.
            </Callout>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 6 · Review                                                          */}
      {/* ------------------------------------------------------------------ */}
      <Section id="review" wide>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
          <BandHeading
            eyebrow="06 · Review"
            title="A second set of eyes, with somewhere to put its findings."
            lead="Review in most practices is a conversation that leaves no record. Here it is a queue, a set of notes attached to the fields they concern, and a state the return has to leave before it can be filed."
          />
          <div>
            <CheckList
              items={[
                'Returns enter the review queue when the preparer marks them ready.',
                'A reviewer works from the same navigator, with the diagnostics rail beside them.',
                'Notes attach to a field or a section, and stay with the return.',
                'Returning a return to the preparer records who returned it and why.',
                'Sign-off is recorded against the reviewer and the version of the return they saw.',
                'A practice can require review on every return, or only where it chooses to.',
              ]}
            />
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 7 · Authorization                                                   */}
      {/* ------------------------------------------------------------------ */}
      <Section id="authorization" tone="alt" wide>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
          <BandHeading
            eyebrow="07 · Electronic authorization"
            title="The taxpayer reads the return, then signs for it."
            lead="Form 8879 is the moment a taxpayer takes responsibility for what is about to be filed. It deserves more than a checkbox at the end of a wizard."
          />
          <div>
            <CheckList
              items={[
                'The prepared return is presented for reading before the signature is requested.',
                'Both spouses sign separately on a joint return, each from their own session.',
                'The signature is bound to the version of the return that was displayed — a later change requires a new authorization.',
                'The signed record is retained with the return for as long as the practice retains it.',
                'A taxpayer who would rather sign on paper can, and the paper authorization is recorded in the same place.',
                'Transmission stays locked until the authorization exists.',
              ]}
            />
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 8 · Filing                                                          */}
      {/* ------------------------------------------------------------------ */}
      <Section id="filing" wide>
        <BandHeading
          eyebrow="08 · E-file and rejection handling"
          title="A submission is a record, not an event."
          lead="Every transmission is kept: what was sent, when, by whom, and what came back. A rejection is part of that history rather than something to be quietly overwritten."
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
          <FilingTimelinePreview />
          <div>
            <CheckList
              items={[
                'The federal return and the Pennsylvania return are assembled from the same file.',
                'A submission cannot be built while a reject or an error diagnostic is open.',
                'Acknowledgements are tracked, and shown against the return and in the portal.',
                'A rejection arrives with the agency’s reason and reopens the return at the responsible field where one can be identified.',
                'The corrected return is retransmitted as a new submission against the same history.',
                'Nothing about an earlier attempt is deleted when a later one succeeds.',
              ]}
            />
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 9 · Portal                                                          */}
      {/* ------------------------------------------------------------------ */}
      <Section id="portal" tone="alt" wide>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
          <div>
            <BandHeading
              eyebrow="09 · Client portal"
              title="Five destinations, and no more."
              lead="A taxpayer visits their portal a handful of times a year. It has to be obvious on the first visit and on the fifth, which rules out most of what a product like this is tempted to put there."
            />
            <CheckList
              className="mt-8"
              items={[
                'Overview — where the return stands, in one sentence.',
                'Your information — the intake questions, resumable.',
                'Documents — what has arrived, what is still needed, and where to put it.',
                'Sign — read the return, then authorize it.',
                'Filing status — transmitted, acknowledged, or corrected and resent.',
              ]}
            />
          </div>
          <div className="mx-auto w-full max-w-md lg:max-w-lg">
            <PortalPreview />
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 10 · Reporting                                                      */}
      {/* ------------------------------------------------------------------ */}
      <Section id="reporting" wide>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
          <BandHeading
            eyebrow="10 · Reporting"
            title="What a practice needs to know in February."
            lead="Reporting here is operational rather than decorative: which returns are stuck, which are waiting on a taxpayer, and which came back rejected."
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <Panel>
              <PanelHeader title="Work in hand" />
              <PanelBody>
                <ul className="flex flex-col gap-2 text-sm text-ink-muted">
                  <li>Returns by stage and by preparer</li>
                  <li>Returns waiting on a taxpayer, and for how long</li>
                  <li>The review queue and its age</li>
                  <li>Outstanding document requests</li>
                </ul>
              </PanelBody>
            </Panel>
            <Panel>
              <PanelHeader title="Filing and compliance" />
              <PanelBody>
                <ul className="flex flex-col gap-2 text-sm text-ink-muted">
                  <li>Submissions by state: transmitted, accepted, rejected</li>
                  <li>Rejections grouped by reason, so a pattern is visible</li>
                  <li>Authorizations outstanding</li>
                  <li>Audit history, exportable per return or per user</li>
                </ul>
              </PanelBody>
            </Panel>
          </div>
        </div>
      </Section>

      <CtaBand
        title="See the same ten parts as one continuous process."
        lead="The workflow page follows a single return from the first intake question through to the acknowledgement, showing what the preparer does and what the taxpayer sees at each stage."
        primary={{ label: 'How it works', href: '/how-it-works' }}
        secondary={{ label: 'Security and privacy', href: '/security' }}
      />
    </>
  );
}
