import { PageIntro } from "@/components/primitives";
import { ProjectForm } from "@/components/project-form";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Start a Project",
  "Tell GhimTech about the workflow, manual process, or administrative bottleneck that is slowing your business down.",
  "/contact",
);
export default function Contact() {
  return (
    <>
      <PageIntro label="Start a project" title="Tell us what’s slowing your business down.">
        <p>
          Show us the workflow, spreadsheet, or administrative bottleneck that is becoming difficult
          to manage. We’ll determine whether software can simplify it.
        </p>
      </PageIntro>
      <div className="container contact-layout">
        <aside className="contact-aside">
          <h2>
            Bring the problem.
            <br />
            We’ll work through it.
          </h2>
          <p>
            You don’t need a technical brief or a finished plan. A clear description of how the work
            happens today is enough.
          </p>
          <ol>
            <li>Tell us about the business and the workflow.</li>
            <li>We review where a system could help.</li>
            <li>We discuss scope, fit, and a practical next step.</li>
          </ol>
        </aside>
        <ProjectForm />
      </div>
    </>
  );
}
