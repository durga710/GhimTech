/**
 * What each section of the federal return asks for.
 *
 * The data-entry workspace is generic — it knows how to render a grid of fields,
 * how to validate them and how to walk them one question at a time — and this
 * file is where the return itself is described to it. Keeping the two apart is
 * what lets the same component serve a form-style grid and an interview without
 * either being a special case of the other.
 *
 * Every field carries three things beyond its value: the path into the return
 * (so a diagnostic can point at it), the box of the source document it is keyed
 * from (so the document panel can mark it), and the question a preparer would
 * ask a client out loud (so the interview reads like a conversation rather than
 * a form read aloud).
 */
import { amountValue, maskedTin, sampleReturn, usd, type FederalSectionId } from '@/lib/demo/return';
import type { Money } from '@ghimtech-tax/tax-engine-federal';

export type EntryKind =
  | 'text'
  | 'amount'
  | 'ein'
  | 'masked'
  | 'date'
  | 'months'
  | 'select'
  | 'checkbox'
  | 'readonly';

export interface EntryOption {
  value: string;
  label: string;
}

export interface EntryField {
  /** Path into the return. Also the anchor a diagnostic navigates to. */
  path: string;
  label: string;
  kind: EntryKind;
  value: string;
  /** Guidance shown under the label in the grid. */
  hint?: string;
  /** The same field, asked as a question, for the interview. */
  question?: string;
  /** A sentence of help shown only in the interview. */
  help?: string;
  /** Box of the source document, e.g. `Box 1`. */
  box?: string;
  required?: boolean;
  options?: readonly EntryOption[];
  checked?: boolean;
  /** Explains a value the preparer cannot type over. */
  note?: string;
}

export interface EntryGroup {
  id: string;
  title: string;
  description?: string;
  fields: readonly EntryField[];
}

export interface SectionForm {
  id: FederalSectionId;
  title: string;
  lead: string;
  groups: readonly EntryGroup[];
  /** Source documents worth having open while this section is keyed. */
  documentIds: readonly string[];
}

function at<T>(list: readonly T[], index: number): T {
  const value = list[index];
  if (value === undefined) {
    throw new Error(`The sample return has no entry at index ${index}.`);
  }
  return value;
}

function money(value: Money | undefined): string {
  return value === undefined ? '' : amountValue(value);
}

const FILING_STATUS_OPTIONS: readonly EntryOption[] = [
  { value: 'single', label: 'Single' },
  { value: 'marriedFilingJointly', label: 'Married filing jointly' },
  { value: 'marriedFilingSeparately', label: 'Married filing separately' },
  { value: 'headOfHousehold', label: 'Head of household' },
  { value: 'qualifyingSurvivingSpouse', label: 'Qualifying surviving spouse' },
];

const RELATIONSHIP_OPTIONS: readonly EntryOption[] = [
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
  { value: 'stepchild', label: 'Stepchild' },
  { value: 'fosterChild', label: 'Foster child' },
  { value: 'grandchild', label: 'Grandchild' },
  { value: 'brother', label: 'Brother' },
  { value: 'sister', label: 'Sister' },
  { value: 'parent', label: 'Parent' },
  { value: 'other', label: 'Other' },
];

const CREDIT_ELECTION_OPTIONS: readonly EntryOption[] = [
  { value: 'ctc', label: 'Child Tax Credit' },
  { value: 'odc', label: 'Credit for Other Dependents' },
  { value: 'none', label: 'No credit claimed' },
];

const MASKED_TIN_HINT = 'Shown masked. Changing it requires the identity verification step.';

function personFields(prefix: 'taxpayer' | 'spouse', who: string): readonly EntryField[] {
  const person = prefix === 'taxpayer' ? sampleReturn.taxpayer : sampleReturn.spouse;
  if (!person) return [];
  return [
    {
      path: `${prefix}.firstName`,
      label: 'First name',
      kind: 'text',
      value: person.firstName,
      required: true,
      question: `What is the ${who}'s first name, exactly as it appears on the Social Security card?`,
      help: 'The IRS matches the first four letters of the last name as a name control, so spelling matters more than it looks.',
    },
    {
      path: `${prefix}.middleInitial`,
      label: 'Middle initial',
      kind: 'text',
      value: person.middleInitial ?? '',
      question: `Does the ${who} use a middle initial?`,
    },
    {
      path: `${prefix}.lastName`,
      label: 'Last name',
      kind: 'text',
      value: person.lastName,
      required: true,
      question: `And the ${who}'s last name?`,
    },
    {
      path: `${prefix}.tin`,
      label: 'Identification number',
      kind: 'masked',
      value: maskedTin(person.tin),
      hint: MASKED_TIN_HINT,
      question: `Confirm the last four digits of the ${who}'s Social Security number.`,
      help: 'Full numbers are never displayed in this product, on any screen.',
    },
    {
      path: `${prefix}.dateOfBirth`,
      label: 'Date of birth',
      kind: 'date',
      value: person.dateOfBirth,
      required: true,
      question: `What is the ${who}'s date of birth?`,
      help: 'Age at the close of the tax year drives the standard deduction and several credits.',
    },
    {
      path: `${prefix}.occupation`,
      label: 'Occupation',
      kind: 'text',
      value: person.occupation ?? '',
      question: `What is the ${who}'s occupation?`,
    },
    {
      path: `${prefix}.identityProtectionPin`,
      label: 'Identity Protection PIN',
      kind: 'text',
      value: person.identityProtectionPin ?? '',
      hint: 'Six digits, from the current-year CP01A notice. Leave blank if none was issued.',
      question: `Has the IRS issued the ${who} an Identity Protection PIN this year?`,
      help: 'A prior-year IP PIN will be rejected. Only the current-year notice is accepted.',
    },
  ];
}

function filingStatusSection(): SectionForm {
  const { address } = sampleReturn;
  return {
    id: 'filing-status',
    title: 'Filing status and taxpayer',
    lead: 'The header of the return: who is filing, under which status, and where the IRS should write.',
    documentIds: [],
    groups: [
      {
        id: 'status',
        title: 'Filing status',
        description: 'Status is determined at the close of the tax year, not at the date of filing.',
        fields: [
          {
            path: 'filingStatus',
            label: 'Filing status',
            kind: 'select',
            value: sampleReturn.filingStatus,
            options: FILING_STATUS_OPTIONS,
            required: true,
            question: 'What was the marital status at the close of the year?',
            help: 'A couple married on 31 December is treated as married for the whole year.',
          },
          {
            path: 'livedApartFromSpouseLastSixMonths',
            label: 'Lived apart from spouse for the last six months',
            kind: 'checkbox',
            value: '',
            checked: sampleReturn.livedApartFromSpouseLastSixMonths === true,
            hint: 'Supports head of household and the separated-spouse Earned Income Credit election.',
            question: 'Did the couple live apart for the last six months of the year?',
          },
          {
            path: 'digitalAssetTransactions',
            label: 'Digital asset transactions during the year',
            kind: 'checkbox',
            value: '',
            checked: sampleReturn.digitalAssetTransactions === true,
            hint: 'Every Form 1040 asks this, and it must be answered either way.',
            question:
              'Did either of them receive, sell, exchange or otherwise dispose of a digital asset?',
          },
        ],
      },
      {
        id: 'taxpayer',
        title: 'Primary taxpayer',
        fields: personFields('taxpayer', 'taxpayer'),
      },
      {
        id: 'spouse',
        title: 'Spouse',
        description: 'A joint return carries both identities in the header.',
        fields: personFields('spouse', 'spouse'),
      },
      {
        id: 'address',
        title: 'Mailing address',
        fields: [
          {
            path: 'address.line1',
            label: 'Street address',
            kind: 'text',
            value: address.line1,
            required: true,
            question: 'What is the mailing address?',
          },
          {
            path: 'address.line2',
            label: 'Apartment, suite or unit',
            kind: 'text',
            value: address.line2 ?? '',
          },
          {
            path: 'address.city',
            label: 'City or town',
            kind: 'text',
            value: address.city,
            required: true,
          },
          {
            path: 'address.state',
            label: 'State',
            kind: 'text',
            value: address.state ?? '',
            hint: 'Two letters. Use AA, AE or AP for a military post address.',
            required: true,
          },
          {
            path: 'address.zip',
            label: 'ZIP code',
            kind: 'text',
            value: address.zip ?? '',
            hint: 'Five digits, or ZIP+4.',
            required: true,
          },
        ],
      },
    ],
  };
}

function dependentsSection(): SectionForm {
  const groups: EntryGroup[] = sampleReturn.dependents.map((dependent, index) => {
    const election = dependent.claimedForChildTaxCredit
      ? 'ctc'
      : dependent.claimedForOtherDependentCredit
        ? 'odc'
        : 'none';
    return {
      id: `dependent-${index}`,
      title: `Dependent ${index + 1} · ${dependent.firstName} ${dependent.lastName}`,
      fields: [
        {
          path: `dependents[${index}].firstName`,
          label: 'First name',
          kind: 'text',
          value: dependent.firstName,
          required: true,
          question: `What is dependent ${index + 1}'s first name?`,
        },
        {
          path: `dependents[${index}].lastName`,
          label: 'Last name',
          kind: 'text',
          value: dependent.lastName,
          required: true,
          question: 'And the last name?',
        },
        {
          path: `dependents[${index}].tin`,
          label: 'Identification number',
          kind: 'masked',
          value: maskedTin(dependent.tin),
          hint: MASKED_TIN_HINT,
          question: 'Confirm the last four digits of their Social Security number.',
        },
        {
          path: `dependents[${index}].dateOfBirth`,
          label: 'Date of birth',
          kind: 'date',
          value: dependent.dateOfBirth,
          required: true,
          question: 'What is their date of birth?',
          help: 'Age at 31 December decides the Child Tax Credit; a child who turns 17 during the year no longer qualifies.',
        },
        {
          path: `dependents[${index}].relationship`,
          label: 'Relationship',
          kind: 'select',
          value: dependent.relationship,
          options: RELATIONSHIP_OPTIONS,
          required: true,
          question: 'How is this dependent related to the taxpayer?',
        },
        {
          path: `dependents[${index}].monthsLivedWithTaxpayer`,
          label: 'Months lived in the home',
          kind: 'months',
          value: String(dependent.monthsLivedWithTaxpayer),
          hint: 'A whole number from 0 to 12.',
          question: 'How many months did they live in the home during the year?',
          help: 'A qualifying child must live in the home for more than half the year unless an absence reason applies.',
        },
        {
          path: `dependents[${index}].claimedForChildTaxCredit`,
          label: 'Credit claimed',
          kind: 'select',
          value: election,
          options: CREDIT_ELECTION_OPTIONS,
          question: 'Which credit is being claimed for this dependent?',
          help: 'A dependent supports one credit or the other, never both.',
        },
      ],
    };
  });

  return {
    id: 'dependents',
    title: 'Dependents',
    lead: 'Everyone claimed on the return, and the credit each of them supports.',
    documentIds: [],
    groups,
  };
}

function w2Group(index: number, id: string): EntryGroup {
  const w2 = at(sampleReturn.income.w2s, index);
  return {
    id,
    title: `Form W-2 · ${w2.employerName}`,
    description: `${w2.belongsTo === 'taxpayer' ? 'Taxpayer' : 'Spouse'} · keyed from the document in the file.`,
    fields: [
      {
        path: `income.w2s[${index}].employerEin`,
        label: 'Employer identification number',
        kind: 'ein',
        value: w2.employerEin,
        box: 'Box b',
        required: true,
        question: 'What is the employer identification number in box b?',
        help: 'Nine digits. No EIN has ever been issued beginning 00.',
      },
      {
        path: `income.w2s[${index}].employerName`,
        label: 'Employer name',
        kind: 'text',
        value: w2.employerName,
        box: 'Box c',
        required: true,
        question: 'Which employer issued this W-2?',
      },
      {
        path: `income.w2s[${index}].wages`,
        label: 'Wages, tips, other compensation',
        kind: 'amount',
        value: money(w2.wages),
        box: 'Box 1',
        required: true,
        question: 'What is in box 1, wages, tips and other compensation?',
      },
      {
        path: `income.w2s[${index}].federalIncomeTaxWithheld`,
        label: 'Federal income tax withheld',
        kind: 'amount',
        value: money(w2.federalIncomeTaxWithheld),
        box: 'Box 2',
        question: 'What is in box 2, federal income tax withheld?',
        help: 'Boxes 1 and 2 are the pair most often transposed.',
      },
      {
        path: `income.w2s[${index}].socialSecurityWages`,
        label: 'Social Security wages',
        kind: 'amount',
        value: money(w2.socialSecurityWages),
        box: 'Box 3',
        question: 'What is in box 3, Social Security wages?',
      },
      {
        path: `income.w2s[${index}].socialSecurityTaxWithheld`,
        label: 'Social Security tax withheld',
        kind: 'amount',
        value: money(w2.socialSecurityTaxWithheld),
        box: 'Box 4',
        question: 'What is in box 4, Social Security tax withheld?',
        help: 'This should be 6.2% of box 3 plus box 7, give or take payroll rounding.',
      },
      {
        path: `income.w2s[${index}].medicareWages`,
        label: 'Medicare wages and tips',
        kind: 'amount',
        value: money(w2.medicareWages),
        box: 'Box 5',
        question: 'What is in box 5, Medicare wages and tips?',
      },
      {
        path: `income.w2s[${index}].medicareTaxWithheld`,
        label: 'Medicare tax withheld',
        kind: 'amount',
        value: money(w2.medicareTaxWithheld),
        box: 'Box 6',
        question: 'What is in box 6, Medicare tax withheld?',
        help: 'At least 1.45% of box 5. More is normal for a high earner paying the Additional Medicare Tax.',
      },
    ],
  };
}

function incomeSection(): SectionForm {
  const int0 = at(sampleReturn.income.form1099Int ?? [], 0);
  const div0 = at(sampleReturn.income.form1099Div ?? [], 0);
  const nec0 = at(sampleReturn.income.form1099Nec ?? [], 0);

  return {
    id: 'income',
    title: 'Income',
    lead: 'Every source document in the file, keyed box by box.',
    documentIds: ['w2-ahn', 'w2-scr', '1099int-dollar', '1099div-keystone', '1099nec-carnegie'],
    groups: [
      w2Group(0, 'w2-0'),
      w2Group(1, 'w2-1'),
      {
        id: 'int-0',
        title: `Form 1099-INT · ${int0.payerName}`,
        fields: [
          {
            path: 'income.form1099Int[0].payerName',
            label: 'Payer',
            kind: 'text',
            value: int0.payerName,
            required: true,
            question: 'Which institution paid the interest?',
          },
          {
            path: 'income.form1099Int[0].interestIncome',
            label: 'Interest income',
            kind: 'amount',
            value: money(int0.interestIncome),
            box: 'Box 1',
            question: 'What is in box 1, interest income?',
          },
        ],
      },
      {
        id: 'div-0',
        title: `Form 1099-DIV · ${div0.payerName}`,
        fields: [
          {
            path: 'income.form1099Div[0].payerName',
            label: 'Payer',
            kind: 'text',
            value: div0.payerName,
            required: true,
            question: 'Which fund or broker paid the dividends?',
          },
          {
            path: 'income.form1099Div[0].ordinaryDividends',
            label: 'Total ordinary dividends',
            kind: 'amount',
            value: money(div0.ordinaryDividends),
            box: 'Box 1a',
            question: 'What is in box 1a, total ordinary dividends?',
          },
          {
            path: 'income.form1099Div[0].qualifiedDividends',
            label: 'Qualified dividends',
            kind: 'amount',
            value: money(div0.qualifiedDividends),
            box: 'Box 1b',
            question: 'What is in box 1b, qualified dividends?',
            help: 'Box 1b is part of box 1a and can never be larger.',
          },
          {
            path: 'income.form1099Div[0].capitalGainDistributions',
            label: 'Capital gain distributions',
            kind: 'amount',
            value: money(div0.capitalGainDistributions),
            box: 'Box 2a',
            question: 'What is in box 2a, total capital gain distributions?',
          },
        ],
      },
      {
        id: 'nec-0',
        title: `Form 1099-NEC · ${nec0.payerName}`,
        description: 'Nonemployee compensation carries self-employment tax on Schedule SE.',
        fields: [
          {
            path: 'income.form1099Nec[0].payerName',
            label: 'Payer',
            kind: 'text',
            value: nec0.payerName,
            required: true,
            question: 'Who paid the nonemployee compensation?',
          },
          {
            path: 'income.form1099Nec[0].nonemployeeCompensation',
            label: 'Nonemployee compensation',
            kind: 'amount',
            value: money(nec0.nonemployeeCompensation),
            box: 'Box 1',
            question: 'What is in box 1, nonemployee compensation?',
            help: 'Confirm the Schedule C expenses were captured before this figure reaches Schedule SE.',
          },
        ],
      },
    ],
  };
}

function adjustmentsSection(): SectionForm {
  return {
    id: 'adjustments',
    title: 'Adjustments',
    lead: 'Deductions taken above the line, before adjusted gross income.',
    documentIds: [],
    groups: [
      {
        id: 'schedule-1-part-2',
        title: 'Schedule 1, Part II',
        fields: [
          {
            path: 'adjustments.educatorExpenses',
            label: 'Educator expenses',
            kind: 'amount',
            value: '',
            question: 'Did either of them pay out of pocket for classroom supplies?',
          },
          {
            path: 'adjustments.hsaDeduction',
            label: 'Health savings account deduction',
            kind: 'amount',
            value: '',
            question: 'Was a contribution made to a health savings account?',
          },
          {
            path: 'adjustments.selfEmploymentTaxDeduction',
            label: 'Deductible part of self-employment tax',
            kind: 'readonly',
            value: '419.65',
            note: 'Computed from the Schedule SE liability on the 1099-NEC income.',
            question: 'Half of the self-employment tax is deducted automatically.',
          },
          {
            path: 'adjustments.iraDeduction',
            label: 'IRA deduction',
            kind: 'amount',
            value: '',
            question: 'Was a deductible contribution made to a traditional IRA?',
          },
          {
            path: 'adjustments.studentLoanInterest',
            label: 'Student loan interest deduction',
            kind: 'amount',
            value: '420.00',
            hint: 'From Form 1098-E. Capped at $2,500 and phased out by income.',
            question: 'Was student loan interest paid during the year?',
          },
        ],
      },
    ],
  };
}

function deductionsSection(): SectionForm {
  const itemized = sampleReturn.deduction.itemized ?? {};
  return {
    id: 'deductions',
    title: 'Deductions',
    lead: 'The standard deduction, or the Schedule A detail that beats it.',
    documentIds: [],
    groups: [
      {
        id: 'method',
        title: 'Method',
        description:
          'The standard deduction for married filing jointly in 2025 is $31,500. Itemizing is worth it only above that.',
        fields: [
          {
            path: 'deduction.method',
            label: 'Deduction method',
            kind: 'select',
            value: sampleReturn.deduction.method,
            options: [
              { value: 'standard', label: 'Standard deduction' },
              { value: 'itemized', label: 'Itemized deductions' },
            ],
            question: 'Standard deduction, or itemize?',
            help: 'Enter the Schedule A detail either way — the comparison only means something once both figures exist.',
          },
        ],
      },
      {
        id: 'schedule-a',
        title: 'Schedule A',
        fields: [
          {
            path: 'deduction.itemized.medicalAndDental',
            label: 'Medical and dental expenses',
            kind: 'amount',
            value: money(itemized.medicalAndDental),
            hint: 'Deductible only above 7.5% of adjusted gross income.',
            question: 'What did they pay in unreimbursed medical and dental expenses?',
          },
          {
            path: 'deduction.itemized.stateAndLocalIncomeOrSalesTax',
            label: 'State and local income or sales tax',
            kind: 'amount',
            value: money(itemized.stateAndLocalIncomeOrSalesTax),
            hint: 'The state and local tax deduction is capped.',
            question: 'How much state and local income or sales tax was paid?',
          },
          {
            path: 'deduction.itemized.realEstateTaxes',
            label: 'Real estate taxes',
            kind: 'amount',
            value: money(itemized.realEstateTaxes),
            question: 'How much was paid in real estate taxes?',
          },
          {
            path: 'deduction.itemized.homeMortgageInterest',
            label: 'Home mortgage interest',
            kind: 'amount',
            value: money(itemized.homeMortgageInterest),
            hint: 'From Form 1098, box 1.',
            question: 'What is the mortgage interest from the Form 1098?',
          },
          {
            path: 'deduction.itemized.charitableCash',
            label: 'Charitable contributions by cash or cheque',
            kind: 'amount',
            value: money(itemized.charitableCash),
            question: 'What was given to charity in cash or by cheque?',
            help: 'Every gift of $250 or more needs a contemporaneous written acknowledgement.',
          },
          {
            path: 'deduction.itemized.charitableNonCash',
            label: 'Charitable contributions other than cash',
            kind: 'amount',
            value: money(itemized.charitableNonCash),
            question: 'Was anything other than cash given to charity?',
          },
          {
            path: 'deduction.itemizedTotal',
            label: 'Total itemized deductions',
            kind: 'readonly',
            value: amountValue(3_380_000),
            note: 'Sum of the Schedule A detail above.',
          },
        ],
      },
    ],
  };
}

function creditsSection(): SectionForm {
  const credits = sampleReturn.credits ?? {};
  return {
    id: 'credits',
    title: 'Credits',
    lead: 'Elections made on the return. Each one carries a due-diligence obligation.',
    documentIds: [],
    groups: [
      {
        id: 'family',
        title: 'Family credits',
        fields: [
          {
            path: 'credits.childAndDependentCareCredit',
            label: 'Child and dependent care credit',
            kind: 'checkbox',
            value: '',
            checked: credits.childAndDependentCareCredit === true,
            hint: 'Needs a qualifying person under 13, or one incapable of self-care.',
            question: 'Did they pay for care so that both of them could work?',
            help: 'Form 2441 needs the provider’s name, address and identification number.',
          },
          {
            path: 'credits.earnedIncomeCredit',
            label: 'Earned Income Credit',
            kind: 'checkbox',
            value: '',
            checked: credits.earnedIncomeCredit === true,
            hint: 'Refundable, heavily examined, and barred above the investment income ceiling.',
            question: 'Is the Earned Income Credit being claimed?',
          },
          {
            path: 'credits.retirementSavingsContributionsCredit',
            label: 'Retirement savings contributions credit',
            kind: 'checkbox',
            value: '',
            checked: credits.retirementSavingsContributionsCredit === true,
            question: 'Did either of them contribute to a retirement plan or IRA?',
          },
        ],
      },
      {
        id: 'education',
        title: 'Education and health',
        fields: [
          {
            path: 'credits.educationCredit',
            label: 'Education credit',
            kind: 'select',
            value: credits.educationCredit ?? 'none',
            options: [
              { value: 'none', label: 'None claimed' },
              { value: 'americanOpportunity', label: 'American Opportunity Credit' },
              { value: 'lifetimeLearning', label: 'Lifetime Learning Credit' },
            ],
            question: 'Was tuition paid for anyone on this return?',
            help: 'A Form 1098-T is needed, and the American Opportunity Credit is limited to four years per student.',
          },
          {
            path: 'credits.premiumTaxCredit',
            label: 'Premium tax credit',
            kind: 'checkbox',
            value: '',
            checked: credits.premiumTaxCredit === true,
            hint: 'Required whenever a Form 1095-A is in the file.',
            question: 'Did anyone have marketplace health coverage during the year?',
          },
        ],
      },
    ],
  };
}

function paymentsSection(): SectionForm {
  const payments = sampleReturn.payments ?? {};
  const account = sampleReturn.refund?.account;
  return {
    id: 'payments',
    title: 'Payments',
    lead: 'What has already been paid, and where the difference goes.',
    documentIds: [],
    groups: [
      {
        id: 'paid',
        title: 'Payments made',
        fields: [
          {
            path: 'payments.documentWithholding',
            label: 'Federal withholding from source documents',
            kind: 'readonly',
            value: amountValue(1_435_000),
            note: 'Summed from the W-2s and 1099s entered under Income. It cannot be typed over.',
          },
          {
            path: 'payments.estimatedTaxPayments',
            label: 'Estimated tax payments',
            kind: 'amount',
            value: money(payments.estimatedTaxPayments),
            question: 'What was paid in quarterly estimates during the year?',
            help: 'Check the dates as well as the total; a late instalment carries its own penalty.',
          },
          {
            path: 'payments.priorYearOverpaymentApplied',
            label: 'Prior-year overpayment applied',
            kind: 'amount',
            value: money(payments.priorYearOverpaymentApplied),
            question: 'Was any part of last year’s refund carried forward?',
          },
          {
            path: 'payments.extensionPayment',
            label: 'Amount paid with an extension request',
            kind: 'amount',
            value: money(payments.extensionPayment),
            question: 'Was anything paid with a Form 4868 extension?',
          },
        ],
      },
      {
        id: 'refund',
        title: 'Refund election',
        description: 'Bank details are read back to the client before the return is authorized.',
        fields: [
          {
            path: 'refund.method',
            label: 'Refund method',
            kind: 'select',
            value: sampleReturn.refund?.method ?? 'directDeposit',
            options: [
              { value: 'directDeposit', label: 'Direct deposit' },
              { value: 'paperCheck', label: 'Paper cheque' },
              { value: 'applyToNextYear', label: 'Apply to next year' },
            ],
            question: 'How should the refund be paid?',
          },
          {
            path: 'refund.account.routingNumber',
            label: 'Routing number',
            kind: 'text',
            value: account?.routingNumber ?? '',
            hint: 'Nine digits from a cheque, not from a deposit slip.',
            question: 'What is the routing number?',
            help: 'A single transposed digit breaks the ABA check digit, which is exactly what it is for.',
          },
          {
            path: 'refund.account.accountNumber',
            label: 'Account number',
            kind: 'masked',
            value: `••••••••${(account?.accountNumber ?? '').slice(-4)}`,
            hint: 'Shown masked. Re-enter it in full to change it.',
            question: 'Confirm the last four digits of the account number.',
          },
          {
            path: 'refund.account.accountType',
            label: 'Account type',
            kind: 'select',
            value: account?.accountType ?? 'checking',
            options: [
              { value: 'checking', label: 'Checking' },
              { value: 'savings', label: 'Savings' },
            ],
            question: 'Is that a checking or a savings account?',
          },
        ],
      },
    ],
  };
}

const SECTIONS: Record<FederalSectionId, () => SectionForm> = {
  'filing-status': filingStatusSection,
  dependents: dependentsSection,
  income: incomeSection,
  adjustments: adjustmentsSection,
  deductions: deductionsSection,
  credits: creditsSection,
  payments: paymentsSection,
};

export function federalSection(id: FederalSectionId): SectionForm {
  return SECTIONS[id]();
}

/** Flattened fields, in the order they are keyed. */
export function sectionFields(form: SectionForm): readonly EntryField[] {
  return form.groups.flatMap((group) => group.fields);
}

/** The running total a section footer states, where the section has one. */
export function sectionTotalLabel(id: FederalSectionId): string | undefined {
  if (id === 'income') return `Total income entered · ${usd(15_206_465)}`;
  if (id === 'deductions') return `Total itemized deductions · ${usd(3_380_000)}`;
  if (id === 'payments') return `Total payments · ${usd(1_555_000)}`;
  return undefined;
}
