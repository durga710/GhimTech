import type { Metadata } from 'next';
import { ButtonLink, TextLink } from '@/components/ui/button';
import { Callout } from '@/components/ui/surface';
import { PageHero } from '@/components/marketing/page-hero';
import { MarketingSection } from '@/components/marketing/section';
import { List, Prose } from '@/components/marketing/prose';
import { StatusLegend, StatusTable, type StatusRow } from '@/components/marketing/status-table';
import { CONTACT_MAILTO } from '@/components/marketing/site-contact';

const description =
  'An honest matrix of the tax situations GhimTech Tax handles for tax year 2025 — wages, interest and dividends, retirement distributions, self-employment, itemized deductions, dependants and credits — and, just as clearly, the ones it does not.';

export const metadata: Metadata = {
  title: 'Supported tax situations',
  description,
  alternates: { canonical: '/supported-tax-situations' },
  openGraph: {
    type: 'website',
    url: '/supported-tax-situations',
    title: 'Supported tax situations · GhimTech Tax',
    description,
  },
};

const INCOME_ROWS: StatusRow[] = [
  {
    label: 'Wages and salaries (W-2)',
    note: 'Any number of employers, with withholding, dependent care benefits, and the retirement plan and statutory employee boxes carried through. Excess Social Security withholding across employers is detected.',
    level: 'supported',
  },
  {
    label: 'Interest (1099-INT, 1099-OID)',
    note: 'Taxable and tax-exempt interest, early withdrawal penalties, and US savings bond interest. Schedule B is produced when the thresholds or the foreign account questions require it.',
    level: 'supported',
  },
  {
    label: 'Dividends (1099-DIV)',
    note: 'Ordinary and qualified dividends, capital gain distributions, and Section 199A dividends.',
    level: 'supported',
  },
  {
    label: 'Retirement distributions (1099-R)',
    note: 'Pensions, annuities, IRA distributions, rollovers, and the early distribution additional tax. The Pennsylvania treatment is computed separately and is frequently not the federal number.',
    level: 'supported',
  },
  {
    label: 'Social Security benefits (SSA-1099)',
    note: 'The taxable portion is computed from the provisional income test. Pennsylvania does not tax these benefits.',
    level: 'supported',
  },
  {
    label: 'Unemployment compensation (1099-G)',
    note: 'Including state and local refunds reported on the same form, with the itemizing test applied to any prior-year refund.',
    level: 'supported',
  },
  {
    label: 'Self-employment (Schedule C)',
    note: 'Sole proprietors and single-member LLCs on the cash method, with Schedule SE, the deductible half of self-employment tax, and the qualified business income deduction where it applies.',
    level: 'supported',
  },
  {
    label: 'Gambling and lottery winnings (W-2G)',
    note: 'Federal treatment, and the Pennsylvania class of income these fall into.',
    level: 'supported',
  },
  {
    label: 'Capital gains and losses (Schedule D, Form 8949)',
    note: 'Broker sales with covered basis reported on a 1099-B are handled. Wash sales, Section 1256 contracts, digital asset disposals and non-covered lots needing basis reconstruction are not yet.',
    level: 'in-progress',
  },
  {
    label: 'Rents, royalties, K-1s (Schedule E)',
    note: 'Rental property, royalties, and income from partnerships, S corporations, estates and trusts are not handled. This is the most common reason a return will not fit here.',
    level: 'unsupported',
  },
  {
    label: 'Farm income (Schedule F, Form 4835)',
    note: 'Not handled, including farm rental income.',
    level: 'unsupported',
  },
  {
    label: 'Foreign earned income and foreign accounts',
    note: 'Form 2555, Form 1116, Form 8938 and FinCEN Form 114 are not handled. If you have a foreign account or foreign income, this is not the right software.',
    level: 'unsupported',
  },
];

const DEDUCTION_ROWS: StatusRow[] = [
  {
    label: 'Standard deduction',
    note: 'All five filing statuses, with the additional amounts for age 65 and blindness, and the reduced amount where someone can be claimed as a dependant.',
    level: 'supported',
  },
  {
    label: 'Itemized deductions (Schedule A)',
    note: 'Medical and dental above the floor, state and local taxes within the cap, mortgage interest and points, investment interest, and cash and non-cash charitable contributions within the applicable limits.',
    level: 'supported',
  },
  {
    label: 'Adjustments to income (Schedule 1)',
    note: 'Educator expenses, student loan interest, self-employed health insurance, half of self-employment tax, IRA deductions, and the deductible portion of self-employed retirement contributions.',
    level: 'supported',
  },
  {
    label: 'Health savings accounts (Form 8889)',
    note: 'Contributions and distributions are being built. Do not rely on it for the coming season.',
    level: 'in-progress',
  },
  {
    label: 'Depreciation and home office (Forms 4562, 8829)',
    note: 'A Schedule C with depreciable assets or a home office deduction is not yet handled. Simple service businesses with current-year expenses are.',
    level: 'in-progress',
  },
  {
    label: 'Casualty and theft losses (Form 4684)',
    note: 'Not handled.',
    level: 'unsupported',
  },
];

const CREDIT_ROWS: StatusRow[] = [
  {
    label: 'Child Tax Credit and Additional CTC (Schedule 8812)',
    note: 'Qualifying child tests, the identification number requirements, the phase-out, and the refundable portion.',
    level: 'supported',
  },
  {
    label: 'Credit for Other Dependants',
    note: 'For dependants who do not meet the CTC age or identification tests but do qualify here.',
    level: 'supported',
  },
  {
    label: 'Earned Income Credit (Schedule EIC)',
    note: 'With and without qualifying children, including the investment income limit, the age tests, and the tie-breaker rules where two people could claim the same child.',
    level: 'supported',
  },
  {
    label: 'Education credits (Form 8863)',
    note: 'American Opportunity Credit and Lifetime Learning Credit from Form 1098-T, with the four-year, half-time and felony-conviction tests for the AOTC.',
    level: 'supported',
  },
  {
    label: 'Child and Dependent Care Credit (Form 2441)',
    note: 'Including the earned income limitation and employer-provided dependent care benefits from the W-2.',
    level: 'supported',
  },
  {
    label: 'Retirement Savings Contributions Credit (Form 8880)',
    note: 'With the distribution look-back that reduces eligible contributions.',
    level: 'supported',
  },
  {
    label: 'Premium Tax Credit (Form 8962)',
    note: 'Reconciliation of advance payments from Form 1095-A is under active work. Shared policy allocation and the alternative calculation for a year of marriage are not planned for the first release.',
    level: 'in-progress',
  },
  {
    label: 'Residential energy and clean vehicle credits',
    note: 'Forms 5695, 8936 and 8911 are not handled.',
    level: 'unsupported',
  },
  {
    label: 'Foreign tax credit (Form 1116)',
    note: 'Not handled, including the election to claim a small amount of foreign tax without the form.',
    level: 'unsupported',
  },
];

const HOUSEHOLD_ROWS: StatusRow[] = [
  {
    label: 'Filing statuses',
    note: 'Single, married filing jointly, married filing separately, head of household, and qualifying surviving spouse — with the tests that decide which one a taxpayer is entitled to.',
    level: 'supported',
  },
  {
    label: 'Dependants',
    note: 'Qualifying child and qualifying relative tests, including residency, support, age and joint-return tests, and multiple support arrangements.',
    level: 'supported',
  },
  {
    label: 'Identity protection PINs and prior-year AGI',
    note: 'Both are collected and carried into the electronic filing, since a wrong prior-year AGI is the most common cause of a rejection that has nothing to do with the return itself.',
    level: 'supported',
  },
  {
    label: 'Deceased taxpayers and Form 1310',
    note: 'A return for a taxpayer who died during the year is being built. The refund claim by a personal representative is not yet available.',
    level: 'in-progress',
  },
  {
    label: 'Injured or innocent spouse (Forms 8379, 8857)',
    note: 'Not handled.',
    level: 'unsupported',
  },
];

const RETURN_ROWS: StatusRow[] = [
  {
    label: 'Tax year 2025',
    note: 'The year the calculation engine is built and tested for — returns filed in 2026.',
    level: 'supported',
  },
  {
    label: 'Federal Form 1040 and Pennsylvania PA-40',
    note: 'A full-year Pennsylvania resident filing a federal return and a state return together.',
    level: 'supported',
  },
  {
    label: 'Local Pennsylvania earned income tax',
    note: 'The annual local return is prepared from the same figures, but it is not transmitted through the federal or state electronic filing channel — you file it with your tax collector.',
    level: 'in-progress',
  },
  {
    label: 'Part-year and non-resident Pennsylvania returns',
    note: 'A taxpayer who moved into or out of Pennsylvania during the year is not yet handled.',
    level: 'in-progress',
  },
  {
    label: 'Prior tax years',
    note: 'Only tax year 2025 is available. Constants, thresholds and rules differ by year, and we would rather support one year correctly than five approximately.',
    level: 'unsupported',
  },
  {
    label: 'Amended returns (Form 1040-X)',
    note: 'Not yet available. Planned, because a preparer who cannot amend is a preparer with a problem.',
    level: 'in-progress',
  },
  {
    label: 'States other than Pennsylvania',
    note: 'No other state return is supported, and neither is a multi-state or reciprocal-agreement situation.',
    level: 'unsupported',
  },
  {
    label: 'Non-resident alien returns (Form 1040-NR)',
    note: 'Not handled.',
    level: 'unsupported',
  },
  {
    label: 'Business, trust and estate returns',
    note: 'Forms 1065, 1120, 1120-S, 1041 and 709 are outside the scope of this product entirely.',
    level: 'unsupported',
  },
];

export default function SupportedTaxSituationsPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        eyebrow="Product"
        title="Supported tax situations"
        lead="Most software tells you what it can do. This page also tells you what it cannot, in the same amount of detail, because finding that out in March is a genuinely bad afternoon."
        meta="Scope shown is for tax year 2025 — the returns filed in 2026."
      />

      <MarketingSection
        id="how-to-read"
        eyebrow="The key"
        title="How to read this page"
        bordered={false}
      >
        <StatusLegend />
        <Prose className="mt-10">
          <p>
            &ldquo;In progress&rdquo; is a real answer, not a soft no. It means the work is underway
            and part of it exists, and it means you should not commit a client&rsquo;s season to it.
            If a line below decides whether this software works for your practice, write to us and
            ask where it actually stands — we will tell you.
          </p>
        </Prose>
      </MarketingSection>

      <MarketingSection
        id="income"
        eyebrow="Income"
        title="Income and where it comes from"
        lead="The forms that arrive in January and February, and what happens to each of them."
        tone="alt"
      >
        <StatusTable
          caption="Support for income types and the forms that report them"
          rows={INCOME_ROWS}
        />
      </MarketingSection>

      <MarketingSection
        id="deductions"
        eyebrow="Deductions"
        title="Deductions and adjustments"
        lead="Whether a taxpayer takes the standard deduction or itemises, and what can reduce income before the deduction is applied."
      >
        <StatusTable
          caption="Support for deductions and adjustments to income"
          rows={DEDUCTION_ROWS}
        />
      </MarketingSection>

      <MarketingSection
        id="credits"
        eyebrow="Credits"
        title="Dependants and credits"
        lead="The credits that most often decide whether a household receives a refund, and the eligibility tests behind them."
        tone="alt"
      >
        <StatusTable caption="Support for tax credits" rows={CREDIT_ROWS} />
      </MarketingSection>

      <MarketingSection
        id="household"
        eyebrow="The taxpayer"
        title="Filing status, dependants and identity"
      >
        <StatusTable
          caption="Support for filing status, dependants and taxpayer identity"
          rows={HOUSEHOLD_ROWS}
        />
      </MarketingSection>

      <MarketingSection id="returns" eyebrow="Coverage" title="Which returns, and which years" tone="alt">
        <StatusTable
          caption="Support by return type and tax year"
          itemHeading="Return or year"
          rows={RETURN_ROWS}
        />
      </MarketingSection>

      <MarketingSection
        id="limits"
        eyebrow="Plainly"
        title="When this is the wrong software"
        lead="Rather than make you assemble it from five tables, here is the short version."
      >
        <Prose>
          <p>Look elsewhere, for now, if the return involves any of the following.</p>
          <List
            items={[
              'Rental property, royalties, or a Schedule K-1 from a partnership, S corporation, estate or trust.',
              'A state other than Pennsylvania, a move into or out of Pennsylvania during the year, or work in a state with a reciprocal agreement.',
              'Foreign income, a foreign bank account, or a foreign tax credit.',
              'A tax year other than 2025, or an amendment to a return already filed.',
              'A business entity return, an estate or trust return, or a gift tax return.',
              'A brokerage account with wash sales, futures, or digital asset disposals.',
            ]}
          />
          <Callout tone="warning" title="One more honest note">
            This page describes the scope of the software. It is not a determination about your
            return, and nothing here is tax advice. A situation that looks simple on a list can turn
            out not to be — that is what the preparer, and the diagnostics we run before filing, are
            for.
          </Callout>
        </Prose>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/federal-and-pennsylvania" size="lg">
            Federal and Pennsylvania in detail
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary" size="lg">
            Ask about your situation
          </ButtonLink>
        </div>
        <p className="mt-6 text-sm text-ink-muted">
          Not sure which row your return falls into?{' '}
          <TextLink href={CONTACT_MAILTO}>Write to us</TextLink> and describe it — a short answer
          costs us nothing and saves you a season.
        </p>
      </MarketingSection>
    </>
  );
}
