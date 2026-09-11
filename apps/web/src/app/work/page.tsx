import Link from "next/link";
import { projects } from "@/lib/content";
import { PageIntro, ProjectCTA } from "@/components/primitives";
import { ProjectFeature } from "@/components/project-feature";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Work",
  "Explore GhimTech’s work behind real business operations, starting with CyanjelHomeCare LLC.",
  "/work",
);
export default function Work() {
  return (
    <>
      <PageIntro label="Work / Real business, real systems" title="Software with a job to do.">
        <p>The best way to understand GhimTech is to look at the business behind the software.</p>
      </PageIntro>
      <ProjectFeature />
      {projects.length > 1 && (
        <section className="container section">
          {projects.slice(1).map((p) => (
            <Link className="article-row" href={"/work/" + p.slug} key={p.slug}>
              <span className="mini-label">{p.industry}</span>
              <h2>{p.company}</h2>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </section>
      )}
      <section className="container section prose-grid">
        <h2>
          Built for the day
          <br />
          after launch.
        </h2>
        <div>
          <p>
            Operational software has to hold up when a schedule changes, a record is incomplete, or
            a task needs a person’s judgment. The work is in those details.
          </p>
          <p>
            CyanjelHomeCare is our flagship example of an ongoing relationship between a business
            and the technology built around it.
          </p>
        </div>
      </section>
      <ProjectCTA />
    </>
  );
}
