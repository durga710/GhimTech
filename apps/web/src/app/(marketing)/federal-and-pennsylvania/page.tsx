import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button';
import { Callout } from '@/components/ui/surface';
import { PageHero } from '@/components/marketing/page-hero';
import { MarketingSection, SubHeading } from '@/components/marketing/section';
import { DetailList, List, Prose } from '@/components/marketing/prose';
import { StatusTable, type StatusRow } from '@/components/marketing/status-table';

const description =
  'Form 1040 and its common schedules, the Pennsylvania PA-40 and the Commonwealth’s flat personal income tax, the places where Pennsylvania deliberately departs from federal treatment, and the local earned income tax return that sits alongside the state one.';

export const metadata: Metadata = {
  title: 'Federal and Pennsylvania',
  description,
  alternates: { canonical: '/federal-and-pennsylvania' },
  openGraph: {
    type: 'website',
    url: '/federal-and-pennsylvania',
    title: 'Federal and Pennsylvania · GhimTech Tax',
    description,
  },
};

const FEDERAL_FORMS: StatusRow[] = [
  {
    label: 'Form 1040',
    note: 'The return itself: filing status, dependants, income, deduction, tax, credits, payments, and the refund or balance due.',
    level: 'supported',
  },
  {
    label: 'Schedule 1',
    note: 'Additional income and adjustments to income — business income, unemployment, educator expenses, student loan interest, the deductible half of self-employment tax.',
    level: 'supported',
  },
  {
    label: 'Schedule 2',
    note: 'Additional taxes: self-employment tax, the additional tax on early retirement distributions, and the Additional Medicare Tax.',
    level: 'supported',
  },
  {
    label: 'Schedule 3',
    note: 'Non-refundable and other credits, and other payments.',
    level: 'supported',
  },
  {
    label: 'Schedule A',
    note: 'Itemized deductions, compared against the standard deduction so that the taxpayer takes whichever is larger.',
    level: 'supported',
  },
  {
    label: 'Schedule B',
    note: 'Interest and ordinary dividends, produced when the amounts or the foreign account questions require it.',
    level: 'supported',
  },
  {
    label: 'Schedule C and Schedule SE',
    note: 'Sole proprietor profit or loss on the cash method, and the self-employment tax that follows from it.',
    level: 'supported',
  },
  {
    label: 'Schedule 8812, Schedule EIC',
    note: 'The child-related credits and the earned income credit, with the qualifying child tests applied rather than assumed.',
    level: 'supported',
  },
  {
    label: 'Forms 2441, 8863, 8880',
    note: 'Dependent care, education, and retirement savings contributions credits.',
    level: 'supported',
  },
  {
    label: 'Schedule D and Form 8949',
    note: 'Covered-basis broker sales are handled; the harder capital gain situations are still being built.',
    level: 'in-progress',
  },
  {
    label: 'Schedule E, Schedule F',
    note: 'Rental, royalty, pass-through and farm income are not handled.',
    level: 'unsupported',
  },
];

const PA_FORMS: StatusRow[] = [
  {
    label: 'PA-40',
    note: 'The Pennsylvania personal income tax return for a full-year resident, computed from Pennsylvania’s own rules rather than copied from the federal return.',
    level: 'supported',
  },
  {
    label: 'PA Schedule A and Schedule B',
    note: 'Pennsylvania-taxable interest and dividends, which do not always equal the federal figures.',
    level: 'supported',
  },
  {
    label: 'PA Schedule C',
    note: 'Net profit from a business or profession under Pennsylvania rules, which differ from the federal ones on several expense categories.',
    level: 'supported',
  },
  {
    label: 'PA Schedule W-2S and Schedule UE',
    note: 'Wage reconciliation, and unreimbursed employee business expenses — a deduction Pennsylvania still allows even though the federal equivalent is currently suspended.',
    level: 'supported',
  },
  {
    label: 'PA Schedule SP',
    note: 'Tax Forgiveness, computed from eligibility income rather than from taxable income. Missing it is one of the most expensive oversights on a Pennsylvania return.',
    level: 'supported',
  },
  {
    label: 'PA Schedule G-L',
    note: 'Resident credit for tax paid to another state. Being built; a taxpayer with out-of-state income is not yet well served here.',
    level: 'in-progress',
  },
  {
    label: 'PA Schedule D',
    note: 'Net gains from the disposition of property under Pennsylvania rules. In progress, in step with the federal Schedule D work.',
    level: 'in-progress',
  },
  {
    label: 'PA-40 NRC and part-year returns',
    note: 'Non-resident and part-year resident filings are not yet handled.',
    level: 'unsupported',
  },
];

export default function FederalAndPennsylvaniaPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        eyebrow="Product"
        title="Federal and Pennsylvania"
        lead="Two returns, prepared together, from one set of facts — but not from one set of rules. Pennsylvania departs from federal treatment often enough that copying a federal number into a state field is a reliable way to get a return wrong."
        meta="General information about forms and how the software handles them. It is not tax advice, and it is not a substitute for the instructions published by the IRS and the Pennsylvania Department of Revenue."
      />

      <MarketingSection
        id="federal"
        eyebrow="Federal"
        title="Form 1040 and its schedules"
        lead="The federal return is assembled from the answers given at intake and the documents uploaded against them, and every schedule is produced because a rule required it — not because a box was ticked."
        bordered={false}
      >
        <StatusTable
          caption="Federal forms and schedules, and how they are handled"
          itemHeading="Form or schedule"
          rows={FEDERAL_FORMS}
        />
        <Prose className="mt-10">
          <p>
            Before anything is transmitted, the return is run through a set of diagnostics that
            check it against the rules rather than against a spell-checker: identification numbers
            and their formats, dependant eligibility, filing status entitlement, credit thresholds,
            and internal arithmetic consistency. Findings are graded, and the ones that would cause
            a rejection block the filing rather than warning about it politely.
          </p>
        </Prose>
      </MarketingSection>

      <MarketingSection
        id="pennsylvania"
        eyebrow="Pennsylvania"
        title="The PA-40 and a flat tax that is not simple"
        lead="Pennsylvania levies a flat personal income tax — one rate, no brackets, no graduated schedule. That makes the arithmetic easy and the eligibility rules the entire job."
        tone="alt"
      >
        <Prose>
          <p>
            The rate has stood at 3.07 percent for two decades. The software applies the rate in
            force for the tax year being prepared; if you are checking a figure by hand, confirm the
            rate against the Department of Revenue for that year rather than against this page.
          </p>
          <p>
            Flatness is where the simplicity ends. Pennsylvania has no standard deduction and no
            personal exemption, allows only a short list of deductions, and — most importantly —
            sorts income into eight separate classes.
          </p>
        </Prose>

        <div className="mt-10">
          <SubHeading>The eight classes of income</SubHeading>
          <Prose className="mt-4 max-w-none">
            <List
              items={[
                'Compensation.',
                'Interest.',
                'Dividends.',
                'Net profits from a business, profession or farm.',
                'Net gains from the disposition of property.',
                'Net gains from rents, royalties, patents and copyrights.',
                'Income from estates or trusts.',
                'Gambling and lottery winnings.',
              ]}
            />
            <p>
              A loss in one class cannot offset income in another. A taxpayer with a business loss
              and wage income does not net them the way the federal return does — the loss stays in
              its class, and the wages are taxed in full. This single rule accounts for a large
              share of Pennsylvania returns that come out wrong when they are prepared as a copy of
              the federal one.
            </p>
          </Prose>
        </div>

        <StatusTable
          className="mt-10"
          caption="Pennsylvania forms and schedules, and how they are handled"
          itemHeading="Form or schedule"
          rows={PA_FORMS}
        />
      </MarketingSection>

      <MarketingSection
        id="retirement"
        eyebrow="Where the two diverge"
        title="Retirement income is the big one"
        lead="If you remember one difference between the federal return and the Pennsylvania return, make it this one."
      >
        <Prose>
          <p>
            Pennsylvania does not follow federal treatment of many retirement distributions. In
            broad terms, the Commonwealth does not tax Social Security benefits at all, and it
            generally does not tax distributions from an eligible employer-sponsored retirement plan
            or an IRA taken after the taxpayer has met the plan&rsquo;s retirement requirements.
          </p>
          <p>
            The words doing the work there are <em>generally</em> and <em>eligible</em>. A
            distribution taken before those conditions are met can be taxable to Pennsylvania to the
            extent it exceeds what the taxpayer already contributed, because the Commonwealth uses a
            cost-recovery approach rather than the federal taxable-amount figure. There is a related
            asymmetry earlier in the cycle: elective deferrals into a 401(k) reduce federal
            compensation but are generally included in Pennsylvania compensation in the year they
            are made — which is precisely why they are not taxed again on the way out.
          </p>
          <p>
            The practical consequence for anyone reading a Form 1099-R: the taxable amount in box 2a
            is a federal figure. It is frequently not the Pennsylvania figure, and the software
            computes the Pennsylvania amount separately rather than carrying box 2a across.
          </p>
          <Callout tone="warning" title="This area is genuinely nuanced">
            Plan type, the taxpayer&rsquo;s age, the plan&rsquo;s own retirement conditions,
            distribution codes, rollovers and conversions all bear on the answer, and edge cases are
            common. The software raises a diagnostic and asks for a human decision rather than
            guessing, and where a distribution is unusual it should be reviewed against the
            Department of Revenue&rsquo;s guidance for that plan type.
          </Callout>
        </Prose>
      </MarketingSection>

      <MarketingSection
        id="other-differences"
        eyebrow="Also worth knowing"
        title="Other places Pennsylvania goes its own way"
        tone="alt"
      >
        <DetailList
          columns={2}
          items={[
            {
              term: 'No standard deduction, no exemptions',
              description:
                'Pennsylvania taxable income is not reduced by a standard deduction or a personal exemption. Relief for lower-income households comes through Tax Forgiveness on Schedule SP instead, which is calculated from eligibility income — a broader measure that includes items the PA-40 itself does not tax.',
            },
            {
              term: 'Unreimbursed employee expenses survive',
              description:
                'Pennsylvania continues to allow allowable unreimbursed business expenses on Schedule UE for employees, a deduction the federal return currently suspends. It is a real deduction with real substantiation requirements.',
            },
            {
              term: 'A short list of deductions',
              description:
                'Contributions to 529 accounts, medical savings accounts, health savings accounts and ABLE accounts are deductible within limits. That is close to the whole list.',
            },
            {
              term: 'Business expenses differ',
              description:
                'PA Schedule C does not follow federal rules on every line — depreciation methods and certain expense categories diverge, so a federal Schedule C is a starting point rather than an answer.',
            },
            {
              term: 'Lottery and gambling winnings',
              description:
                'These form their own class of income for Pennsylvania purposes, including cash prizes from the Pennsylvania Lottery.',
            },
            {
              term: 'Filing jointly is not automatic',
              description:
                'Pennsylvania allows a joint return, but because income classes are tracked per spouse and losses cannot cross between them, the joint figures are not simply the sum of two federal columns.',
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection
        id="local"
        eyebrow="The third return"
        title="Local earned income tax sits alongside the state return"
        lead="Pennsylvania is unusual in how much tax is collected locally, and how easy it is for a taxpayer to forget the filing entirely."
      >
        <Prose>
          <p>
            Most Pennsylvania residents outside Philadelphia owe an earned income tax to their
            municipality and school district, and file an annual local return with the collector
            appointed for their tax collection district. It is a separate return, with its own form
            and its own instructions, and it is not part of the PA-40.
          </p>
          <p>
            Philadelphia sits outside that arrangement and operates its own city taxes on a
            different footing. A taxpayer who lives in one jurisdiction and works in another, or who
            moved during the year, can face a genuinely awkward allocation — and there is a separate
            Local Services Tax that is withheld by employers and works differently again.
          </p>
          <p>
            What the software does today: it prepares the local earned income tax figures from the
            same wage and net profit data used for the state return, so nothing has to be re-keyed.
            What it does not do today: transmit that return. Federal and Pennsylvania returns go
            through the electronic filing channel; the local return is prepared for you to file with
            your collector. We would rather say that plainly than let someone discover it in April.
          </p>
          <Callout tone="info" title="A note on deadlines">
            The federal return, the PA-40 and the annual local earned income tax return all
            generally fall due on the same April date, which shifts when it lands on a weekend or a
            holiday. Extensions, estimated payments and the local return each follow their own
            rules — check the current year&rsquo;s instructions rather than relying on memory.
          </Callout>
        </Prose>
      </MarketingSection>

      <MarketingSection id="honesty" eyebrow="Scope" title="What this page is, and is not" tone="alt">
        <Prose>
          <p>
            Everything above is a general description of forms, rules and how this software handles
            them. It is not tax advice, it is not a determination about any particular return, and
            tax law changes. Where a rule is nuanced we have said so rather than flattening it into
            a confident sentence, because a confident sentence about Pennsylvania retirement income
            is usually a wrong one.
          </p>
          <p>
            The authoritative sources are the IRS instructions for the form in question and the
            Pennsylvania Department of Revenue&rsquo;s guidance for the tax year you are filing. If
            this page and those disagree, they are right and we will correct the page.
          </p>
        </Prose>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/supported-tax-situations" size="lg">
            See the full support matrix
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary" size="lg">
            Ask us something specific
          </ButtonLink>
        </div>
      </MarketingSection>
    </>
  );
}
