import { PageIntro } from "@/components/primitives";
import { contactEmail, pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Privacy",
  "How GhimTech handles project enquiries and information submitted through this website.",
  "/privacy",
);
export default function Privacy() {
  return (
    <>
      <PageIntro label="Privacy" title="Your information, with a purpose.">
        <p>This notice covers the public GhimTech website and project enquiry form.</p>
      </PageIntro>
      <div className="legal">
        <h2>What the form collects</h2>
        <p>
          We ask for your name, email, company, and information about the project you want to
          discuss. Website, budget, timeline, and additional context are optional. Do not include
          passwords, access credentials, patient information, or other sensitive personal records.
        </p>
        <h2>How we use it</h2>
        <p>
          Information submitted through the form is used to review your enquiry, respond to you, and
          discuss a potential engagement. Submission does not sign you up for a marketing mailing
          list.
        </p>
        <h2>Delivery and abuse prevention</h2>
        <p>
          Enquiries are processed through the site’s hosting and configured delivery services. A
          keyed hash of a request identifier is used for short-lived abuse prevention. The
          application does not write enquiry content to its console logs. Hosting providers may
          maintain request logs under their own policies.
        </p>
        <h2>Browser storage</h2>
        <p>
          The public website does not set advertising cookies or store your form draft in browser
          storage. Unsubmitted form entries are held in the current page and may be lost if you
          close or reload it.
        </p>
        <h2>Questions and deletion requests</h2>
        <p>
          Email <a href={"mailto:" + contactEmail}>{contactEmail}</a>, use the project enquiry
          form, or reply to an existing GhimTech conversation to request access, correction, or
          deletion of information you have submitted. Information needed for an ongoing engagement
          or recordkeeping may need to be retained.
        </p>
        <h2>Scope</h2>
        <p>
          This notice does not cover separate customer platforms or their operational records. Those
          systems require their own privacy and access arrangements.
        </p>
      </div>
    </>
  );
}
