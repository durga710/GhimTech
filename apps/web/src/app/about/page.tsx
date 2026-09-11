import { PageIntro, Eyebrow, ProjectCTA, Action } from "@/components/primitives";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "About Durga Ghimeray",
  "Meet the founder behind GhimTech and the philosophy behind software built around real business operations.",
  "/about",
);
const principles = [
  [
    "Software should fit the business.",
    "Start with how the company actually works. Preserve useful habits and improve the processes that create unnecessary work.",
  ],
  [
    "Automate the repetitive.",
    "Use software to handle predictable steps so people can focus on decisions, relationships, and exceptions.",
  ],
  [
    "Keep humans in control.",
    "Make rules understandable. Give people visibility, a way to correct information, and a clear path when something goes wrong.",
  ],
  [
    "Build what matters.",
    "A smaller system that handles the right workflow is more useful than a long feature list nobody needs.",
  ],
  [
    "Design for actual operations.",
    "Expect changing schedules, missing information, and people using the system under time pressure. Those are design conditions.",
  ],
  [
    "Improve continuously.",
    "Business software needs ownership after launch. Refine it as the company learns and the work changes.",
  ],
];
export default function About() {
  return (
    <>
      <PageIntro
        label="About / Durga Ghimeray"
        title="I build software for problems businesses shouldn’t still have."
      >
        <p>
          GhimTech is my personal technology brand and software studio. A place to turn operational
          problems into useful products.
        </p>
      </PageIntro>
      <section className="container section founder-section">
        <div className="founder-type" aria-hidden="true">
          Durga
          <br />
          <span>Ghimeray.</span>
          <small>FOUNDER / BUILDER / SYSTEMS THINKER</small>
        </div>
        <div>
          <Eyebrow>Why GhimTech exists</Eyebrow>
          <h2>Too much work happens between the tools.</h2>
          <p>
            Someone copies the same information twice. Someone remembers to send the reminder.
            Someone keeps a spreadsheet that explains what the official system cannot.
          </p>
          <p>
            I’m interested in building the missing structure: software that understands the work,
            connects the steps, and gives people a better way to operate.
          </p>
          <p>
            GhimTech brings that focus to custom business systems, workflow automation, and products
            that can grow alongside a company.
          </p>
        </div>
      </section>
      <section className="container section prose-grid">
        <div>
          <Eyebrow>From idea to operation</Eyebrow>
          <h2>
            Build close
            <br />
            to the business.
          </h2>
        </div>
        <div>
          <p>
            CyanjelHomeCare LLC is fully powered by GhimTech. That relationship grounds the studio
            in the realities of an operating business, where software has to account for people,
            information, and administrative follow-through.
          </p>
          <p>
            The ambition is to keep building products and systems that solve those kinds of
            problems, across industries and over the long term.
          </p>
          <Action href="/work/cyanjel-homecare" secondary>
            Explore the CyanjelHomeCare story
          </Action>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <Eyebrow>Our principles</Eyebrow>
            <h2>A practical view of software.</h2>
          </div>
        </div>
        {principles.map(([title, copy]) => (
          <div className="principle-row" key={title}>
            <h3>{title}</h3>
            <p>{copy}</p>
          </div>
        ))}
      </section>
      <ProjectCTA />
    </>
  );
}
