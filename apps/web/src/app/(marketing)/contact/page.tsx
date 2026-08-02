import type { Metadata } from 'next';
import { TextLink } from '@/components/ui/button';
import { Callout, Panel, PanelBody, PanelHeader } from '@/components/ui/surface';
import { PageHero } from '@/components/marketing/page-hero';
import { MarketingSection } from '@/components/marketing/section';
import { List, Prose } from '@/components/marketing/prose';
import { ContactForm } from '@/components/marketing/contact-form';
import {
  CONTACT_EMAIL,
  CONTACT_MAILTO,
  RESPONSE_INTENT,
} from '@/components/marketing/site-contact';

const description =
  'Reach the people who build GhimTech Tax. Ask whether your returns are supported, raise a security question, report an accessibility barrier, or tell us we have got something wrong.';

export const metadata: Metadata = {
  title: 'Contact',
  description,
  alternates: { canonical: '/contact' },
  openGraph: {
    type: 'website',
    url: '/contact',
    title: 'Contact · GhimTech Tax',
    description,
  },
};

export default function ContactPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        eyebrow="Company"
        title="Contact"
        lead="One address, read by the people who build the product. No ticket queue, no chatbot, and no form that disappears into a system nobody has logged into since launch."
      />

      <MarketingSection
        id="write"
        eyebrow="Send a message"
        title="Tell us what you need"
        bordered={false}
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-14">
          <ContactForm />

          <aside className="flex flex-col gap-6">
            <Panel tone="flat">
              <PanelHeader title="Straight to the inbox" />
              <PanelBody>
                <p className="text-sm text-ink-muted">If you would rather skip the form entirely:</p>
                <p className="mt-2">
                  <TextLink href={CONTACT_MAILTO} className="text-ui">
                    {CONTACT_EMAIL}
                  </TextLink>
                </p>
                <p className="mt-4 text-sm text-ink-muted">
                  A useful subject line — &ldquo;Security&rdquo;, &ldquo;Accessibility&rdquo;,
                  &ldquo;Supported situations&rdquo; — gets your message to the right person faster
                  than any routing form would.
                </p>
              </PanelBody>
            </Panel>

            <Panel tone="flat">
              <PanelHeader title="When you will hear back" />
              <PanelBody>
                <p className="text-sm text-ink-muted">
                  We intend to reply within {RESPONSE_INTENT}. That is an intention, not a guarantee
                  and not a service level — during the filing season it can slip, and we would
                  rather tell you that now than quietly miss a promise later.
                </p>
              </PanelBody>
            </Panel>

            <Callout tone="warning" title="Please do not send tax documents">
              Ordinary email is not a safe channel for Social Security numbers, bank details or
              images of tax forms. Nothing on this page needs them. Once you are a client, documents
              belong in the portal, where they are encrypted and every access is logged.
            </Callout>
          </aside>
        </div>
      </MarketingSection>

      <MarketingSection
        id="what-to-expect"
        eyebrow="Before you write"
        title="A few things worth knowing"
        tone="alt"
      >
        <Prose>
          <List
            items={[
              <>
                <strong className="font-semibold text-ink">
                  Asking whether your return is supported?
                </strong>{' '}
                Describe the income types and any complications — rental property, a K-1, a move
                between states, a foreign account. The{' '}
                <TextLink href="/supported-tax-situations">support matrix</TextLink> answers most of
                these already, and in more detail than a reply would.
              </>,
              <>
                <strong className="font-semibold text-ink">Reporting a security problem?</strong>{' '}
                Put &ldquo;Security&rdquo; in the subject and include what you found, how to
                reproduce it, and what you think the impact is. Our{' '}
                <TextLink href="/security">disclosure position is on the security page</TextLink>.
              </>,
              <>
                <strong className="font-semibold text-ink">Hit an accessibility barrier?</strong>{' '}
                Tell us the page, what you were trying to do, and what you use to browse. We treat
                these as defects, not feedback — see the{' '}
                <TextLink href="/accessibility">accessibility statement</TextLink>.
              </>,
              <>
                <strong className="font-semibold text-ink">Need tax advice?</strong> We cannot give
                it here. We can tell you what the software does and does not handle; what your
                return should say is a conversation with a preparer who has seen your documents.
              </>,
            ]}
          />
        </Prose>
      </MarketingSection>
    </>
  );
}
