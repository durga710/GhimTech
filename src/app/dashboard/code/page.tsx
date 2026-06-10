import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CodeWorkspace } from "@/components/dashboard/code/code-workspace";

export const metadata: Metadata = {
  title: "Code",
  robots: { index: false, follow: false },
};

/**
 * In-browser code editor: open any repo the GITHUB_TOKEN can reach, edit
 * files in Monaco, and commit to a branch — Replit-style, GitHub-backed.
 */
export default async function CodePage({
  searchParams,
}: {
  searchParams: Promise<{ repo?: string | string[] }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const requested = Array.isArray(params.repo) ? params.repo[0] : params.repo;

  const projects = await prisma.project.findMany({
    where: { userId: user.id, sourceRepo: { not: null } },
    select: { sourceRepo: true },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
  const linkedRepos = Array.from(
    new Set(projects.map((p) => p.sourceRepo).filter((r): r is string => Boolean(r))),
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">Code</h1>
        <p className="text-sm text-zinc-400 mt-0.5">
          Edit your repos right here — changes commit straight to GitHub.
        </p>
      </div>
      <CodeWorkspace initialRepo={requested ?? linkedRepos[0] ?? ""} repoOptions={linkedRepos} />
    </div>
  );
}
