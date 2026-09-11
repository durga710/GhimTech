import Link from "next/link";
import { PageIntro, ProjectCTA } from "@/components/primitives";
import { articles } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Insights",
  "Practical notes on business systems, workflow automation, custom software, and the decisions behind better operations.",
  "/insights",
);
export default function Insights() {
  return (
    <>
      <PageIntro label="Insights / Field notes" title="Thinking behind the systems.">
        <p>
          Practical notes on the decisions that make business software useful. Start with the
          workflow, question the assumptions, and build with a clear purpose.
        </p>
      </PageIntro>
      <section className="container section article-list">
        {articles.map((a) => (
          <Link className="article-row" href={"/insights/" + a.slug} key={a.slug}>
            <span className="mini-label">{a.category}</span>
            <div className="article-summary">
              <h2>{a.title}</h2>
              <p>{a.description}</p>
            </div>
            <span>
              {a.readTime}
              <b aria-hidden="true">↗</b>
            </span>
          </Link>
        ))}
      </section>
      <ProjectCTA />
    </>
  );
}
