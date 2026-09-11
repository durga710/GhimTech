import Link from "next/link";
import { Action, Eyebrow, ProjectCTA } from "@/components/primitives";
import { WorkflowHero, ModuleExplorer, Process, Transformation } from "@/components/workflow";
import { ProjectFeature } from "@/components/project-feature";
import { articles } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "GhimTech | Software built around your business",
  "Custom business software, CRM systems, and automated workflows by GhimTech. Powering real-world operations at CyanjelHomeCare LLC.",
  "/",
);
export default function Home() {
  return (
    <>
      <section className="container hero">
        <div className="hero-copy">
          <Eyebrow>Software studio / Founded by Durga Ghimeray</Eyebrow>
          <h1>
            Software built
            <br className="desktop-break" /> around how your
            <br className="desktop-break" /> business <span className="serif-word">actually</span>
            <br className="desktop-break" /> works.
          </h1>
          <p>
            Custom software, CRM systems, and automated workflows that turn repetitive
            administrative work into organized operations.
          </p>
          <div className="hero-actions">
            <Action href="/contact">Start a Project</Action>
            <Action href="#what-we-build" secondary>
              See What We Build
            </Action>
          </div>
        </div>
        <WorkflowHero />
      </section>
      <div className="container proof-line">
        <span className="proof-label">BUILT FOR REAL OPERATIONS</span>
        <Link href="/work/cyanjel-homecare">
          <span className="status-dot" />
          Powering CyanjelHomeCare LLC <span aria-hidden="true">↗</span>
        </Link>
        <span className="proof-end">People. Processes. Software.</span>
      </div>
      <section className="container section problem">
        <div>
          <Eyebrow>The problem</Eyebrow>
          <h2>
            Your business
            <br />
            shouldn’t run
            <br />
            on workarounds.
          </h2>
        </div>
        <div className="problem-right">
          <p className="body-large">
            The work gets done.
            <br />
            But it takes too much work.
          </p>
          <p>
            Information gets copied. Follow-up depends on memory. The process lives across tools and
            inside people’s heads.
          </p>
          <div className="fragment-chain">
            <span>Spreadsheet</span>
            <b>↗</b>
            <span>Email</span>
            <b>↘</b>
            <span>Text message</span>
            <b>↗</b>
            <span>Paper form</span>
            <b>↘</b>
            <span>Phone call</span>
            <b>↗</b>
            <span>Spreadsheet again</span>
          </div>
          <div className="organized-line">
            <span aria-hidden="true">↳</span>
            <strong>One organized GhimTech system.</strong>
          </div>
          <p>We study the workflow, find the friction, and build the system around it.</p>
        </div>
      </section>
      <section id="what-we-build" className="container section build-section">
        <div className="section-heading">
          <div>
            <Eyebrow>What we build</Eyebrow>
            <h2>
              The right system.
              <br />
              For your way of working.
            </h2>
          </div>
          <p>
            From a single internal tool to the software behind an entire operation. Explore how the
            pieces fit.
          </p>
        </div>
        <ModuleExplorer />
      </section>
      <ProjectFeature />
      <section className="container section">
        <Transformation />
      </section>
      <section className="container section process-section">
        <div className="section-heading">
          <div>
            <Eyebrow>How we work</Eyebrow>
            <h2>
              Understand the business.
              <br />
              Then build the system.
            </h2>
          </div>
          <p>
            New systems, better integrations, or ongoing product development. The work starts with
            understanding the operation.
          </p>
        </div>
        <Process />
        <Action href="/services" secondary>
          Find the right starting point
        </Action>
      </section>
      <section className="founder-section container section">
        <div className="founder-type" aria-hidden="true">
          Durga
          <br />
          <span>Ghimeray.</span>
          <small>FOUNDER / BUILDER / SYSTEMS THINKER</small>
        </div>
        <div>
          <Eyebrow>The person behind GhimTech</Eyebrow>
          <h2>I build software for problems businesses shouldn’t still have.</h2>
          <p>
            GhimTech is my technology brand and software studio. I’m interested in the space between
            how a business works and how its software expects it to work.
          </p>
          <p>
            That’s where useful products begin: with the details of a real operation and the
            willingness to build something better.
          </p>
          <Action href="/about" secondary>
            About Durga
          </Action>
        </div>
      </section>
      <section className="container section insights-preview">
        <div className="section-heading">
          <div>
            <Eyebrow>Field notes</Eyebrow>
            <h2>Thinking behind the systems.</h2>
          </div>
          <Action href="/insights" secondary>
            Explore Insights
          </Action>
        </div>
        {articles.slice(0, 2).map((a) => (
          <Link className="article-row" href={"/insights/" + a.slug} key={a.slug}>
            <span className="mini-label">{a.category}</span>
            <h3>{a.title}</h3>
            <span>
              {a.readTime} <b aria-hidden="true">↗</b>
            </span>
          </Link>
        ))}
      </section>
      <ProjectCTA />
    </>
  );
}
