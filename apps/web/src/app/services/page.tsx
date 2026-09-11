import { PageIntro, ProjectCTA, Eyebrow } from "@/components/primitives";
import { Process } from "@/components/workflow";
import { services } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Services",
  "Business software, custom CRM, workflow automation, integrations, and portals organized around the problems they solve.",
  "/services",
);
export default function Services() {
  return (
    <>
      <PageIntro
        label="Services / Built around the problem"
        title="Start with what’s getting in the way."
      >
        <p>
          You don’t need to arrive with a specification. Start with the process that takes too much
          effort, and we’ll work out where software can help.
        </p>
      </PageIntro>
      <section className="container section">
        {services.map(([problem, title, description, tags], i) => (
          <article className="service-row" key={String(problem)}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <h2>{problem}</h2>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
              <div className="service-tags">
                {(tags as string[]).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
      <section className="container section">
        <div className="prose-grid">
          <div>
            <Eyebrow>Ongoing ownership</Eyebrow>
            <h2>
              The launch is
              <br />a starting point.
            </h2>
          </div>
          <div>
            <p>
              Some engagements begin with a single internal tool. Others become an ongoing
              technology partnership. GhimTech can support new system development, workflow
              modernization, integrations, and continued product development.
            </p>
            <p>
              The scope follows the operation: what needs to work now, what can wait, and how the
              system will be maintained.
            </p>
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <Eyebrow>Our approach</Eyebrow>
            <h2>Understand. Simplify. Build.</h2>
          </div>
        </div>
        <Process />
      </section>
      <ProjectCTA />
    </>
  );
}
