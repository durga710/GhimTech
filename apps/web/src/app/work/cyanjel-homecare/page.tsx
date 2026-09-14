import Image from "next/image";
import { CaseDetails } from "@/components/case-details";
import { PageIntro, Eyebrow, ProjectCTA, Action } from "@/components/primitives";
import { CareSystem, Transformation } from "@/components/workflow";
import { projects } from "@/lib/content";
import { pageMetadata, siteUrl } from "@/lib/site";
const project = projects[0];
export const metadata = pageMetadata(
  "Cyanjel Home Care | Home Care Operations",
  project.description,
  "/work/cyanjel-homecare",
);
export default function CaseStudy() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: "Cyanjel Home Care: The systems behind the care",
    description: project.description,
    url: siteUrl + "/work/cyanjel-homecare",
    creator: { "@id": siteUrl + "/#organization" },
    about: { "@type": "Organization", name: project.company, url: "https://cyanjelhomecare.com" },
  };
  return (
    <>
      <div className="case-heading">
        <PageIntro
          label="Cyanjel Home Care LLC / Home Care Operations"
          title="The systems behind the care."
        >
          <p className="case-lead">Fully powered by GhimTech.</p>
          <p>
            A home care business runs on more than schedules. It depends on the information,
            communication, and follow-through that keep people coordinated.
          </p>
        </PageIntro>
      </div>
      <div className="container case-meta">
        <div>
          <span>Company</span>
          <p className="case-company">
            <Image src="/work/cyanjel-home-care-mark.png" alt="" width={141} height={125} />
            Cyanjel Home Care LLC
          </p>
        </div>
        <div>
          <span>Industry</span>
          <p>Home care operations</p>
        </div>
        <div>
          <span>Relationship</span>
          <p>Ongoing technology partnership</p>
        </div>
      </div>
      <section className="container section prose-grid">
        <div>
          <Eyebrow>01 / The operation</Eyebrow>
          <h2>Care happens across people, places, and processes.</h2>
        </div>
        <div>
          <p>{project.problem}</p>
          <p>
            Caregiver coordination, EVV-related processes, employee communication, and documentation
            sit alongside hiring, onboarding, and day-to-day administration.
          </p>
          <p>
            These are normal demands of an operating care business. The opportunity is to bring more
            structure to the way the work moves between them.
          </p>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <Eyebrow>02 / The system</Eyebrow>
            <h2>
              Build around
              <br />
              the operating reality.
            </h2>
          </div>
          <p>{project.system}</p>
        </div>
        <CareSystem />
      </section>
      <section className="container section prose-grid">
        <div>
          <Eyebrow>03 / The approach</Eyebrow>
          <h2>
            The handoff matters
            <br />
            as much as the task.
          </h2>
        </div>
        <div>
          <p>
            A visit-related issue may touch a caregiver, an administrator, communication, and
            supporting documentation. Looking at each part in isolation misses the work of
            connecting them.
          </p>
          <p>
            GhimTech’s approach is to understand that whole sequence, then design the software
            around the people who need to act.
          </p>
          <p className="case-caption">
            The diagram above explains the operating context. Detailed product interfaces and
            individual feature releases are not included in this public case study.
          </p>
        </div>
      </section>
      <section className="container section">
        <Transformation />
      </section>
      <section className="container section prose-grid">
        <div>
          <Eyebrow>04 / The relationship</Eyebrow>
          <h2>
            A technology layer.
            <br />
            An ongoing commitment.
          </h2>
        </div>
        <div>
          <p>
            Cyanjel Home Care’s relationship with GhimTech goes beyond a public website. It is a
            software partnership around the business itself.
          </p>
          <p>
            The direction is clear: connected workflows, understandable status, and software that
            stays close to the operation as it changes. We do not attach unmeasured time savings or
            performance figures to this work.
          </p>
          <Action href="/services" secondary>
            Explore the problems we solve
          </Action>
        </div>
      </section>
      <CaseDetails project={project} />
      <ProjectCTA />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
