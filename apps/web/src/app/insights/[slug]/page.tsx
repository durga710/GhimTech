import { notFound } from "next/navigation";
import { PageIntro, Action, ProjectCTA } from "@/components/primitives";
import { articles } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = articles.find((a) => a.slug === slug);
  return a ? pageMetadata(a.title, a.description, "/insights/" + a.slug) : {};
}
export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = articles.find((a) => a.slug === slug);
  if (!a) notFound();
  return (
    <>
      <PageIntro label={"Insights / " + a.category} title={a.title}>
        <p>{a.description}</p>
        <div className="article-meta">
          <span>GhimTech / Studio notes</span>
          <span>{a.readTime}</span>
        </div>
      </PageIntro>
      <article className="article-body">
        {a.sections.map(([title, copy]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{copy}</p>
          </section>
        ))}
        <div className="article-back">
          <Action href="/insights" secondary>
            All Insights
          </Action>
        </div>
      </article>
      <ProjectCTA />
    </>
  );
}
