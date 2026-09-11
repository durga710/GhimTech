import { notFound } from "next/navigation";
import { projects } from "@/lib/content";
import { PageIntro, ProjectCTA, Eyebrow } from "@/components/primitives";
import { CaseDetails } from "@/components/case-details";
import { pageMetadata } from "@/lib/site";
export function generateStaticParams() {
  return projects.filter((p) => p.slug !== "cyanjel-homecare").map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  return p ? pageMetadata(p.company, p.description, "/work/" + slug) : {};
}
export default async function Project({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  if (!p) notFound();
  return (
    <>
      <PageIntro label={p.company + " / " + p.industry} title={p.title}>
        <p>{p.description}</p>
      </PageIntro>
      <section className="container section prose-grid">
        <div>
          <Eyebrow>The problem</Eyebrow>
          <h2>The work behind the software.</h2>
        </div>
        <p>{p.problem}</p>
      </section>
      <section className="container section prose-grid">
        <div>
          <Eyebrow>The system</Eyebrow>
          <h2>Designed around the operation.</h2>
        </div>
        <div>
          <p>{p.system}</p>
          {p.workflow.length > 0 && (
            <ol className="transform-steps">
              {p.workflow.map((step, i) => (
                <li key={step}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {step}
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
      <CaseDetails project={p} />
      <ProjectCTA />
    </>
  );
}
