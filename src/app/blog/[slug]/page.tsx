import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { CompanyCta } from "@/components/landing/company-cta";
import { POSTS, getPost, formatPostDate } from "@/lib/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: "GhimTech" },
    publisher: { "@type": "Organization", name: "GhimTech", url: "https://ghimtech.org" },
  };

  return (
    <main className="relative overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TopNav />

      <article className="relative pt-40 pb-12 lg:pt-48">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-radial-signal opacity-50" />
        <div className="container max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={15} /> All articles
          </Link>

          <div className="mt-8 flex items-center gap-3 text-xs">
            <span className="chip">{post.tag}</span>
            <span className="font-mono text-zinc-500">{formatPostDate(post.date)}</span>
            <span className="font-mono text-zinc-600">· {post.readingTime}</span>
          </div>

          <h1 className="mt-5 font-display text-display text-white text-balance">{post.title}</h1>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">{post.excerpt}</p>

          <div className="hairline my-10" />

          <div className="space-y-6">
            {post.body.map((para, i) => (
              <p key={i} className="text-lg text-zinc-300 leading-relaxed text-pretty">
                {para}
              </p>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-tactical text-zinc-500">
              Written by {post.author}
            </span>
          </div>
        </div>
      </article>

      <CompanyCta
        eyebrow="Keep reading"
        title={
          <>
            More from the <span className="text-gradient-signal">GhimTech team</span>.
          </>
        }
        sub="Engineering notes, product thinking, and the occasional opinion."
        primary={{ label: "All articles", href: "/blog" }}
        secondary={{ label: "Our products", href: "/products" }}
      />
      <SiteFooter />
    </main>
  );
}
