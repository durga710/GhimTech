import Image from "next/image";
import Link from "next/link";
import type { CaseStudy } from "@/lib/content";
import { projects } from "@/lib/content";
import { Eyebrow } from "./primitives";
/** Render only verified material supplied in the project record. */
export function CaseDetails({ project }: { project: CaseStudy }) {
  const related = projects.filter((p) => project.relatedProjects.includes(p.slug));
  return (
    <>
      {project.capabilities.length > 0 && (
        <section className="container section">
          <Eyebrow>Implemented capabilities</Eyebrow>
          <h2>Inside the system.</h2>
          <ul className="capability-list">
            {project.capabilities.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      )}
      {project.screenshots.length > 0 && (
        <section className="container section">
          <Eyebrow>The product</Eyebrow>
          {project.screenshots.map((s) => (
            <figure className="product-screenshot" key={s.src}>
              <Image
                src={s.src}
                alt={s.alt}
                width={1600}
                height={1000}
                sizes="(max-width: 700px) 100vw, 85vw"
                style={{ height: "auto" }}
              />
              <figcaption>{s.alt}</figcaption>
            </figure>
          ))}
        </section>
      )}
      {project.results.length > 0 && (
        <section className="container section prose-grid">
          <div>
            <Eyebrow>Outcomes</Eyebrow>
            <h2>What changed.</h2>
          </div>
          <ul>
            {project.results.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      )}
      {project.technology.length > 0 && (
        <section className="container section prose-grid">
          <div>
            <Eyebrow>Engineering</Eyebrow>
            <h2>Behind the system.</h2>
          </div>
          <ul>
            {project.technology.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      )}
      {related.length > 0 && (
        <section className="container section">
          <Eyebrow>Related work</Eyebrow>
          {related.map((p) => (
            <Link className="article-row" key={p.slug} href={"/work/" + p.slug}>
              <span className="mini-label">{p.industry}</span>
              <h2>{p.company}</h2>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </section>
      )}
    </>
  );
}
