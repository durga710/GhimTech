import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { TextLink } from '@/components/ui/button';
import { Callout, Eyebrow, Panel, PanelBody, PanelHeader } from '@/components/ui/surface';
import {
  BandHeading,
  CheckList,
  CtaBand,
  FaqList,
  Section,
  StageRail,
} from '@/components/site/marketing';
import {
  DiagnosticsPreview,
  DocumentReviewPreview,
  FilingTimelinePreview,
  PortalPreview,
} from '@/components/site/interface-preview';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'The five stages of a return in GhimTech Tax — intake, documents, preparation, review and signature, filing — and what the preparer does and the taxpayer sees at each one.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    type: 'website',
    url: '/how-it-works',
    title: 'How it works — GhimTech Tax',
    description:
      'Intake, documents, preparation, review and signature, filing. What the preparer does and what the taxpayer sees at every stage of a Federal and Pennsylvania return.',
  },
};

const STAGES = [
  {
    ordinal: '01',
    title: 'Intake',
    summary: 'A guided questionnaire that narrows as the taxpayer answers it.',
  },
  {
    ordinal: '02',
    title: 'Documents',
    summary: 'Sources arrive, are read, and are confirmed against the fields they feed.',
  },
  {
    ordinal: '03',
    title: 'Preparation',
    summary: 'Federal and Pennsylvania are built from one file, with diagnostics running.',
  },
  {
    ordinal: '04',
    title: 'Review and signature',
    summary: 'A reviewer signs off, then the taxpayer authorizes the return.',
  },
  {
    ordinal: '05',
    title: 'Filing',
    summary: 'Transmit, read the acknowledgement, and correct anything that comes back.',
  },
] as const;

/**
 * Every stage on this page is told twice — once from the preparer's side of the
 * screen and once from the taxpayer's. Keeping the two accounts adjacent is the
 * whole argument of the page: they are the same return.
 */
function TwoSided({
  preparer,
  taxpayer,
}: {
  preparer: readonly string[];
  taxpayer: readonly string[];
}): React.JSX.Element {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel>
        <PanelHeader title="What the preparer does" description="In the workspace" />
        <PanelBody>
          <CheckList items={preparer} />
        </PanelBody>
      </Panel>
      <Panel tone="sunken">
        <PanelHeader title="What the taxpayer sees" description="In the client portal" />
        <PanelBody>
          <CheckList items={taxpayer} />
        </PanelBody>
      </Panel>
    </div>
  );
}

function Stage({
  id,
  eyebrow,
  title,
  lead,
  tone,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  tone: 'canvas' | 'alt';
  children: ReactNode;
}): React.JSX.Element {
  return (
    <Section id={id} tone={tone} wide>
      <BandHeading eyebrow={eyebrow} title={title} lead={lead} />
      <div className="mt-10 flex flex-col gap-10">{children}</div>
    </Section>
  );
}

const EXCEPTION_ITEMS = [
  {
    question: 'The taxpayer never sends the last document.',
    answer:
      'The request stays on their outstanding list and on the practice’s report of returns waiting on a taxpayer, with the age of the request. Nothing silently proceeds without it, and nothing is marked complete on the strength of a promise.',
  },
  {
    question: 'A figure changes after the taxpayer has signed.',
    answer:
      'The existing authorization is bound to the version of the return that was displayed when it was signed. Changing the return invalidates it and a fresh authorization is requested, because the taxpayer signed for the earlier figures and not these ones.',
  },
  {
    question: 'The submission is rejected.',
    answer:
      'The rejection is attached to the submission with the reason the agency gave, the return reopens at the responsible field where one can be identified, and the corrected return goes out as a new submission against the same history. The first attempt stays visible.',
  },
  {
    question: 'Two people need to work on the same return.',
    answer:
      'Access is scoped by role, and every change is attributed. A reviewer can hold notes against fields while the preparer works elsewhere in the return, and the audit history shows who changed what and when.',
  },
  {
    question: 'The taxpayer would rather sign on paper.',
    answer:
      'They can. The paper authorization is recorded against the return in the same place as an electronic one, so the filing gate is satisfied by a real record rather than by an exception someone remembered to make.',
  },
] as const;

export default function HowItWorksPage(): React.JSX.Element {
  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-canvas">
        <div className="rail rail-wide py-14 md:py-20">
          <div className="max-w-3xl">
            <Eyebrow>How it works</Eyebrow>
            <h1 className="mt-6 font-display text-h1 font-normal text-ink">
              One return, from the first question to the acknowledgement.
            </h1>
            <p className="mt-6 text-lead text-ink-muted">
              A return passes through five stages. The preparer and the taxpayer see different
              screens at each one, but they are reading the same record — which is why the portal
              can say what is outstanding without anybody being asked to keep it up to date.
            </p>
          </div>

          <StageRail className="mt-12" stages={STAGES} />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Stage 1                                                             */}
      {/* ------------------------------------------------------------------ */}
      <Stage
        id="intake"
        tone="alt"
        eyebrow="Stage 01 · Intake"
        title="Establish who is filing, and what for."
        lead="Intake decides most of the return. Filing status, dependents, residency and the list of expected income sources all follow from it, and so does the list of documents the taxpayer will be asked for."
      >
        <TwoSided
          preparer={[
            'Create the client, or roll last season’s file forward.',
            'Send the intake invitation, or run the interview in the office.',
            'Watch answers arrive in the workspace as they are given.',
            'Confirm identity details, which validate as they are entered.',
            'Set the Pennsylvania municipality that governs the local return.',
          ]}
          taxpayer={[
            'A short set of questions that narrows as they answer.',
            'Last year’s answers offered for confirmation, not a blank form.',
            'The ability to stop and resume from a phone or a laptop.',
            'A plain explanation of why anything sensitive is being asked for.',
            'A running list of what is still needed from them.',
          ]}
        />
        <Callout tone="neutral" title="What the software does with the answers">
          Intake is not stored as a questionnaire and forgotten. Its answers become the household,
          the residency and the expected-income list that the rest of the return is built and
          checked against.
        </Callout>
      </Stage>

      {/* ------------------------------------------------------------------ */}
      {/* Stage 2                                                             */}
      {/* ------------------------------------------------------------------ */}
      <Stage
        id="documents"
        tone="canvas"
        eyebrow="Stage 02 · Documents"
        title="Collect the sources, and confirm them against the return."
        lead="The taxpayer sends the documents; the preparer confirms what they say. The confirmation is the work, so the interface puts the page and the field side by side rather than a filename and a form."
      >
        <DocumentReviewPreview />
        <TwoSided
          preparer={[
            'Request the documents the intake answers imply.',
            'See each upload classified and attached to the return.',
            'Confirm the values read from a page, with the page open beside them.',
            'Reject a document that is illegible and say why, in one action.',
            'Track what is still outstanding without opening a spreadsheet.',
          ]}
          taxpayer={[
            'A list of the documents needed, named the way the form names them.',
            'Camera capture from a phone, or a file picker on a desktop.',
            'Confirmation that a document arrived and was readable.',
            'A clear note when something has to be sent again, and why.',
            'The list shortening as documents are accepted.',
          ]}
        />
      </Stage>

      {/* ------------------------------------------------------------------ */}
      {/* Stage 3                                                             */}
      {/* ------------------------------------------------------------------ */}
      <Stage
        id="preparation"
        tone="alt"
        eyebrow="Stage 03 · Preparation"
        title="Build the federal and Pennsylvania returns together."
        lead="Preparation runs through the navigator: identity, household, income, adjustments, deductions, credits, Pennsylvania, review. Diagnostics run continuously against the file as it is built, so a defect is caught in the section that caused it."
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
          <DiagnosticsPreview />
          <div>
            <h3 className="text-h3 font-semibold text-ink">While the preparer works</h3>
            <CheckList
              className="mt-5"
              items={[
                'Findings appear in a rail beside the return, ranked by severity.',
                'A finding names the field, the form and what to do about it.',
                'Pennsylvania is computed under its own rules from the same entries.',
                'The local earned income tax return follows from the municipality on file.',
                'Nothing is transmitted while a reject or an error is open.',
              ]}
            />
          </div>
        </div>
        <TwoSided
          preparer={[
            'Work the navigator section by section, with completion state per section.',
            'Clear diagnostics as they appear rather than in a batch at the end.',
            'Trace any computed figure back to the entries behind it.',
            'Compare the itemized total against the standard deduction.',
            'Mark the return ready for review when the blocking findings are gone.',
          ]}
          taxpayer={[
            'A status of “in preparation”, with no unfinished figures shown.',
            'Any follow-up question the preparer raises, as a short request.',
            'A notice if a further document turns out to be needed.',
            'No access to a draft return until it is ready to be read.',
            'Nothing to do, and nothing to chase.',
          ]}
        />
      </Stage>

      {/* ------------------------------------------------------------------ */}
      {/* Stage 4                                                             */}
      {/* ------------------------------------------------------------------ */}
      <Stage
        id="review"
        tone="canvas"
        eyebrow="Stage 04 · Review and signature"
        title="A second reading, then the taxpayer authorizes it."
        lead="Review and authorization are two different approvals. The practice checks that the return is right; the taxpayer accepts responsibility for filing it. Both are recorded against the version of the return that was actually seen."
      >
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <TwoSided
            preparer={[
              'Send the return to the review queue when it is ready.',
              'A reviewer reads it against the diagnostics and the source documents.',
              'Notes attach to the field or section they concern.',
              'A return sent back to the preparer records who sent it back, and why.',
              'Sign-off is recorded against the reviewer and the version reviewed.',
              'Request the taxpayer’s authorization once review is complete.',
            ]}
            taxpayer={[
              'A notice that the return is ready to read.',
              'The prepared return, before any signature is asked for.',
              'A plain explanation of what signing the authorization means.',
              'A separate signature for each spouse on a joint return.',
              'A copy of what was signed, retained in the portal.',
              'The option to sign on paper instead.',
            ]}
          />
          <div className="mx-auto w-full max-w-md">
            <PortalPreview />
          </div>
        </div>
        <Callout tone="warning" title="A signature is bound to a version">
          If the return changes after it has been authorized, the existing authorization no longer
          matches what would be filed, and a new one is requested. This is not a formality: the
          taxpayer signed for the figures they were shown.
        </Callout>
      </Stage>

      {/* ------------------------------------------------------------------ */}
      {/* Stage 5                                                             */}
      {/* ------------------------------------------------------------------ */}
      <Stage
        id="filing"
        tone="alt"
        eyebrow="Stage 05 · Filing"
        title="Transmit, then read what comes back."
        lead="The last stage is the one most software treats as a single click. It is a conversation: a submission goes out, an acknowledgement comes back, and sometimes what comes back is a refusal that has to be understood and answered."
      >
        <FilingTimelinePreview />
        <TwoSided
          preparer={[
            'Assemble the federal return and the PA-40 into one submission.',
            'Transmit, with a record of exactly what was sent and when.',
            'Watch for the acknowledgement against the return and in the queue.',
            'On a rejection, read the agency’s reason and reopen the responsible field.',
            'Re-run diagnostics, then retransmit as a new submission.',
            'Close the return once it is accepted, with the history intact.',
          ]}
          taxpayer={[
            'A filing status that moves from transmitted to acknowledged.',
            'Plain language for what a rejection means, and what happens next.',
            'No agency codes presented without an explanation beside them.',
            'A copy of the filed return retained in the portal.',
            'A record of any refund or payment instructions given.',
            'A clear ending: the return is filed and accepted.',
          ]}
        />
      </Stage>

      {/* ------------------------------------------------------------------ */}
      {/* Exceptions                                                          */}
      {/* ------------------------------------------------------------------ */}
      <Section id="exceptions">
        <BandHeading
          eyebrow="When it does not go to plan"
          title="The interesting part of a season is the exceptions."
          lead="Any product can describe the path where everything arrives on time. These are the situations that actually consume a filing season, and what the software does with them."
        />
        <FaqList className="mt-10" items={EXCEPTION_ITEMS} />
        <p className="mt-10 text-sm text-ink-subtle">
          Coverage limits are listed under{' '}
          <TextLink href="/supported-tax-situations">supported tax situations</TextLink>, and the
          protections behind all of the above are described on{' '}
          <TextLink href="/security">security and privacy</TextLink>.
        </p>
      </Section>

      <CtaBand
        title="Read the part of the product you care about most."
        lead="The overview covers each of the ten parts of the software in its own right, from intake through to practice reporting."
        primary={{ label: 'Product overview', href: '/product' }}
        secondary={{ label: 'Contact us', href: '/contact' }}
      />
    </>
  );
}
