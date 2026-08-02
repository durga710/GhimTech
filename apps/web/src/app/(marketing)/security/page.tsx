import type { Metadata } from 'next';
import { ButtonLink, TextLink } from '@/components/ui/button';
import { Callout, Panel, PanelBody, PanelHeader } from '@/components/ui/surface';
import { PageHero } from '@/components/marketing/page-hero';
import { MarketingSection, SubHeading } from '@/components/marketing/section';
import { DetailList, List, Prose, Token } from '@/components/marketing/prose';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/components/marketing/site-contact';

const description =
  'How GhimTech Tax protects source documents and taxpayer identifiers: encryption in transit and at rest, per-user access logging, role separation, masked identifiers, and a plain account of what leaves the system and what does not.';

export const metadata: Metadata = {
  title: 'Security and privacy',
  description,
  alternates: { canonical: '/security' },
  openGraph: {
    type: 'website',
    url: '/security',
    title: 'Security and privacy · GhimTech Tax',
    description,
  },
};

export default function SecurityPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        eyebrow="Trust"
        title="Security and privacy"
        lead="A tax return is the most concentrated file of personal information most people will ever hand over. This page describes the mechanisms we use to protect it — not badges, not logos, and not certifications we have not been granted."
        meta="Written for preparers and for the taxpayers they serve. If something here is unclear or looks wrong, tell us and we will fix the page."
      />

      <MarketingSection
        id="what-we-protect"
        eyebrow="Scope"
        title="What is actually at stake"
        lead="Before the controls, the inventory. These are the categories of information the software holds, and everything below is written in terms of them."
        bordered={false}
      >
        <DetailList
          columns={2}
          items={[
            {
              term: 'Source documents',
              description:
                'Wage and income statements, retirement and brokerage forms, tuition statements, mortgage interest statements, and anything else a taxpayer uploads. Images and PDFs, often photographed on a phone, often containing more than the form itself.',
            },
            {
              term: 'Identifiers',
              description:
                'Social Security and taxpayer identification numbers for the filer, a spouse, and every dependent. Employer identification numbers. Dates of birth. Preparer identification numbers.',
            },
            {
              term: 'Bank details',
              description:
                'Routing and account numbers, where a taxpayer has asked for a direct deposit or an electronic payment. Held only for the return they belong to.',
            },
            {
              term: 'The return itself',
              description:
                'Every figure on the 1040, the PA-40, the supporting schedules, and the diagnostics raised against them — which together describe a household in more detail than the documents did.',
            },
            {
              term: 'Signatures and authorizations',
              description:
                'Form 8879 authorizations and the audit trail behind them: who signed, from where, and when.',
            },
            {
              term: 'Correspondence',
              description:
                'Messages between a taxpayer and a preparer inside the portal, and the notes a preparer records against a return.',
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection id="encryption" eyebrow="In transit and at rest" title="Encryption" tone="alt">
        <Prose>
          <p>
            Every connection to the application is served over HTTPS. The site is delivered with
            HTTP Strict Transport Security, so a browser that has visited once will refuse to fall
            back to an unencrypted connection afterwards, and modern TLS is required — the older
            protocol versions are not offered at all.
          </p>
          <p>
            Uploaded documents are written to object storage with server-side encryption enabled;
            the database that holds return data and identifiers is encrypted at rest, as are its
            automated backups. Encryption keys are held in the hosting platform&rsquo;s managed key
            service rather than in application configuration, which means no key is ever checked
            into a repository or printed by a deployment script.
          </p>
          <p>
            Encryption at rest protects a stolen disk or a mislaid backup. It does not protect
            against a valid login being misused, which is why most of this page is about access
            rather than about ciphers.
          </p>
        </Prose>
      </MarketingSection>

      <MarketingSection
        id="identifiers"
        eyebrow="Masking"
        title="You will rarely see a full Social Security number"
        lead="Identifiers are treated as write-once, read-almost-never. The interface is built so that the full number appears in the smallest number of places we can manage, and nowhere at all in the places that get copied, exported or emailed."
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <Prose className="max-w-none">
            <p>
              When a taxpayer or a preparer types an identifier, it is visible in the field while
              they type — hiding it there only produces transcription errors. The moment the field
              loses focus, the value masks to its last four digits and stays that way for the rest
              of the session.
            </p>
            <p>
              Everywhere else, the last four digits are the identifier. Client lists, search
              results, review screens, diagnostics, and the views our own people would use to help
              you all render <Token>***-**-6789</Token> and nothing more. Search is built to accept
              the last four, so that nobody ever needs to reveal a full number in order to find a
              record.
            </p>
            <p>
              Identifiers are never written to application logs, never placed in a URL or a query
              string, never sent in the body of an email or a notification, and never included in
              an exported list. The full value is decrypted only where it must appear: on the return
              document itself and in the electronic filing sent to the taxing authority.
            </p>
          </Prose>

          <Panel tone="sunken">
            <PanelHeader title="The same number, in three places" />
            <PanelBody>
              <dl className="flex flex-col gap-4">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-subtle">
                    While it is being typed
                  </dt>
                  <dd className="mt-1.5">
                    <Token>123-45-6789</Token>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-subtle">
                    Everywhere in the interface afterwards
                  </dt>
                  <dd className="mt-1.5">
                    <Token>***-**-6789</Token>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-subtle">
                    Application logs, exports, notifications
                  </dt>
                  <dd className="mt-1.5">
                    <Token>[redacted]</Token>
                  </dd>
                </div>
              </dl>
              <p className="mt-5 text-xs text-ink-subtle">
                The number above is a fictitious example, not a real identifier.
              </p>
            </PanelBody>
          </Panel>
        </div>
      </MarketingSection>

      <MarketingSection
        id="access"
        eyebrow="Who can see what"
        title="Role separation and least privilege"
        tone="alt"
      >
        <Prose>
          <p>
            There are four roles, and they are enforced on the server for every request. Hiding a
            link in a menu is a courtesy, not a control, and we do not treat it as one.
          </p>
        </Prose>
        <DetailList
          className="mt-8"
          columns={2}
          items={[
            {
              term: 'Preparer',
              description:
                'Works on the returns assigned to them. Sees the clients on those returns and nobody else’s.',
            },
            {
              term: 'Reviewer',
              description:
                'Reads a return in full and signs off, or sends it back with notes. Review is a separate role precisely so that the person who prepared a return is not the person who approves it.',
            },
            {
              term: 'Administrator',
              description:
                'Manages users, roles and practice settings, and can read the audit history. An administrator can grant access; they cannot grant it silently.',
            },
            {
              term: 'Client',
              description:
                'Sees their own return, their own documents and their own filing status. Nothing else exists as far as their session is concerned.',
            },
          ]}
        />
        <Prose className="mt-8">
          <p>Alongside the roles:</p>
          <List
            items={[
              'Every person has their own credentials. Shared logins are not supported, because an audit trail with a shared account in it answers no useful question.',
              'Sessions expire after a period of inactivity and can be ended remotely by an administrator.',
              'Access to a practice’s data by us, for support, requires an explicit grant from that practice, is scoped to what was asked about, and is recorded in the same audit history the practice reads.',
              'Removing a person from a practice revokes their sessions, not just their next login.',
            ]}
          />
        </Prose>
      </MarketingSection>

      <MarketingSection id="logging" eyebrow="Access logging" title="Reads are recorded, not only writes">
        <Prose>
          <p>
            Most systems log changes. In a tax practice, the more revealing question is usually who
            looked. Every view of a return, every opening of an uploaded document, every export and
            every authorization event is written to an access log with the acting user, the record
            touched, the action, and the time.
          </p>
          <p>
            The log is append-only by design: the application offers no route to edit or delete an
            entry, and administrators and reviewers can read the history for their own practice
            without asking us for it. Entries carry masked identifiers only, so the audit trail
            never becomes the easiest place to harvest the data it exists to protect.
          </p>
          <Callout tone="info" title="What this gives a practice">
            If a client asks who has seen their file, that is a question a practice can answer for
            itself, from a screen, in about a minute.
          </Callout>
        </Prose>
      </MarketingSection>

      <MarketingSection
        id="boundaries"
        eyebrow="Boundaries"
        title="What leaves the system, and what does not"
        tone="alt"
      >
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <SubHeading>What leaves</SubHeading>
            <Prose className="mt-4 max-w-none">
              <List
                items={[
                  'The return and its schedules, transmitted to the taxing authority through the electronic filing channel, when a taxpayer has authorized it.',
                  'Transactional email — a document request, a signature request, a filing status change. These carry no identifiers and no figures, only a note that something is waiting.',
                  'Aggregate, non-identifying operational metrics we use to keep the service up: error rates, response times, queue depths.',
                ]}
              />
            </Prose>
          </div>
          <div>
            <SubHeading>What does not</SubHeading>
            <Prose className="mt-4 max-w-none">
              <List
                items={[
                  'Return data and documents are not sold, rented, or shared for anyone else’s marketing. Not to lenders, not to insurers, not to advertisers.',
                  'Client documents and return figures are not used to train machine-learning models.',
                  'There is no advertising pixel, no third-party analytics tag and no session-replay script on the public site or in the product. Typefaces are self-hosted, so even a font request does not disclose your visit to anyone.',
                  'Identifiers never appear in logs, exports, notifications or URLs — see the masking section above.',
                ]}
              />
            </Prose>
          </div>
        </div>
        <Prose className="mt-10">
          <p>
            We use a small number of infrastructure providers: cloud hosting and database, object
            storage for documents, transactional email, and the channel that carries an electronic
            filing to the taxing authority. They are bound by contract to process data only on our
            instructions. A current list is available on request — write to{' '}
            <TextLink href={CONTACT_MAILTO}>{CONTACT_EMAIL}</TextLink> and ask for it.
          </p>
          <p>
            Separately, federal law limits what a tax return preparer may do with return information
            at all. Disclosing or using it for anything other than preparing the return generally
            requires a specific, written, informed consent from the taxpayer, and that is the
            standard we hold ourselves to whether or not a particular activity would fall inside it.
          </p>
        </Prose>
      </MarketingSection>

      <MarketingSection id="retention" eyebrow="Lifecycle" title="Retention and deletion">
        <Prose>
          <p>
            A tax practice cannot simply delete records on request: preparers carry their own
            record-retention obligations, and a return that disappears the week before an
            examination helps nobody. So retention is set by the practice, within the limits those
            obligations impose, rather than by us.
          </p>
          <p>What that means in practice:</p>
          <List
            items={[
              'A practice sets a retention period for completed returns and their source documents. The default is the longest period its professional obligations require, not the shortest.',
              'Once the period elapses, records are purged on a schedule rather than lingering indefinitely in a bucket nobody looks at.',
              'A taxpayer can ask for their documents to be deleted. Where a retention obligation does not prevent it, the record is removed from live systems promptly and disappears from backups as those backups age out of their own rotation — we do not surgically edit backups, and any policy claiming otherwise should be read sceptically.',
              'Closing a practice’s account triggers an export first, so that nobody loses records they are legally required to keep.',
            ]}
          />
        </Prose>
      </MarketingSection>

      <MarketingSection
        id="incidents"
        eyebrow="When something goes wrong"
        title="Incident response"
        tone="alt"
      >
        <Prose>
          <p>
            We maintain a written incident response procedure covering detection, containment,
            assessment and notification. If personal information held in the service is exposed, we
            will tell the affected practice without unreasonable delay, describe what we know and
            what we do not yet know, and say what we are doing about it. Where Pennsylvania&rsquo;s
            breach notification statute or another applicable law sets a specific requirement, we
            follow it.
          </p>
          <p>
            We would rather send an early notice that turns out to be smaller than feared than a
            polished one that arrives a month late.
          </p>
        </Prose>
      </MarketingSection>

      <MarketingSection
        id="claims"
        eyebrow="Plainly"
        title="What we do not claim"
        lead="This is the part of a security page most companies leave out, which is exactly why it is worth reading."
      >
        <Prose>
          <List
            items={[
              'We hold no security certification or third-party attestation that we have not been granted, and this page displays no badge suggesting otherwise. If you require an independent audit report before you can adopt software, ask us where we stand and we will answer honestly rather than point at a logo.',
              'We cannot guarantee that any return will be accepted for electronic filing, that any refund will arrive, or that a return prepared with this software will not be examined. Nobody can guarantee those things, and a vendor who says they can is telling you something about their other claims.',
              'Encryption, logging and role separation reduce risk. They do not eliminate it. A stolen password with a valid session behind it defeats a great deal of good engineering, which is why per-user credentials and access logging matter more here than any single cryptographic detail.',
            ]}
          />
        </Prose>
      </MarketingSection>

      <MarketingSection
        id="report"
        eyebrow="Responsible disclosure"
        title="Found a weakness? Tell us"
        tone="alt"
      >
        <Prose>
          <p>
            Write to <TextLink href={CONTACT_MAILTO}>{CONTACT_EMAIL}</TextLink> with
            &ldquo;Security&rdquo; in the subject line. Please include what you found, how to
            reproduce it, and what you think the impact is. If you need to send something sensitive,
            say so first and we will arrange a better channel than email.
          </p>
          <p>
            We will not pursue legal action against anyone who reports a problem in good faith,
            gives us a reasonable opportunity to fix it, and does not access, alter or exfiltrate
            data belonging to another person while investigating. Please do not test against real
            taxpayer data — ours or anyone else&rsquo;s.
          </p>
        </Prose>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/contact" size="lg">
            Contact us
          </ButtonLink>
          <ButtonLink href="/privacy" variant="secondary" size="lg">
            Read the privacy policy
          </ButtonLink>
        </div>
      </MarketingSection>
    </>
  );
}
