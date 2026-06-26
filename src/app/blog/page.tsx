import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { POSTS, formatPostDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Engineering notes, product thinking, and culture from the GhimTech team.",
  openGraph: {
    title: "GhimTech Blog",
    description: "Engineering notes, product thinking, and culture.",
  },
};

export default function BlogIndexPage() {
  return (
    <main className="relative overflow-x-clip">
      <TopNav />

      <section className="relative pt-40 pb-12 lg:pt-48">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-radial-signal opacity-60" />
        <div className="container max-w-4xl">
          <span className="eyebrow">Blog</span>
          <h1 className="mt-5 font-display text-hero text-white text-balance">
            Notes from the <span className="text-gradient-signal">build</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
            Engineering decisions, product thinking, and the occasional opinion — written by the people
            shipping the work.
          </p>
        </div>
      </section>

      <section className="container max-w-4xl pb-12">
        <div className="flex flex-col gap-4">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group glass-panel p-6 sm:p-8 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 text-xs">
                <span className="chip">{post.tag}</span>
                <span className="font-mono text-zinc-500">{formatPostDate(post.date)}</span>
                <span className="font-mono text-zinc-600">· {post.readingTime}</span>
              </div>
              <h2 className="mt-4 font-display text-title text-white group-hover:text-signal-200 transition-colors">
                {post.title}
              </h2>
              <p className="mt-3 text-zinc-400 leading-relaxed">{post.excerpt}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-signal-300">
                Read article
                <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
