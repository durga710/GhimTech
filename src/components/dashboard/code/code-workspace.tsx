"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { FileCode2, FilePlus2, FolderGit2, GitCommitHorizontal, Loader2, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full grid place-items-center text-zinc-500 text-sm">
      <span className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> loading editor…
      </span>
    </div>
  ),
});

interface TreeEntry {
  path: string;
  size: number;
}

const LANGUAGES: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  json: "json",
  css: "css",
  scss: "scss",
  html: "html",
  md: "markdown",
  py: "python",
  rb: "ruby",
  go: "go",
  rs: "rust",
  java: "java",
  sql: "sql",
  sh: "shell",
  yml: "yaml",
  yaml: "yaml",
  toml: "ini",
  prisma: "graphql",
};

function languageFor(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return LANGUAGES[ext] ?? "plaintext";
}

/**
 * GitHub-backed code workspace: file tree + Monaco editor + commit bar.
 * Edits accumulate locally (dirty map) and ship as ONE commit to the chosen
 * branch via /api/github/commit. HTML files get a sandboxed live preview —
 * the "run" button for static apps.
 */
export function CodeWorkspace({ initialRepo, repoOptions }: { initialRepo: string; repoOptions: string[] }) {
  const [repoInput, setRepoInput] = useState(initialRepo);
  const [repo, setRepo] = useState(initialRepo);
  const [branch, setBranch] = useState("");
  const [files, setFiles] = useState<TreeEntry[]>([]);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [loadingTree, setLoadingTree] = useState(false);

  const [selected, setSelected] = useState<string | null>(null);
  const [contents, setContents] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Record<string, string>>({});
  const [loadingFile, setLoadingFile] = useState(false);

  const [message, setMessage] = useState("");
  const [committing, setCommitting] = useState(false);
  const [commitNote, setCommitNote] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  const dirtyCount = Object.keys(dirty).length;
  const currentContent = selected ? (dirty[selected] ?? contents[selected] ?? "") : "";

  const loadTree = useCallback(async (target: string) => {
    if (!target) return;
    setLoadingTree(true);
    setTreeError(null);
    setFiles([]);
    setSelected(null);
    setContents({});
    setDirty({});
    setCommitNote(null);
    try {
      const res = await fetch(`/api/github/tree?repo=${encodeURIComponent(target)}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setTreeError(json?.error?.message ?? "Couldn't load the repo.");
      } else {
        setFiles(json.data.files);
        setBranch(json.data.branch);
      }
    } catch {
      setTreeError("Couldn't load the repo.");
    }
    setLoadingTree(false);
  }, []);

  useEffect(() => {
    if (initialRepo) void loadTree(initialRepo);
  }, [initialRepo, loadTree]);

  async function openFile(path: string) {
    setSelected(path);
    setPreview(false);
    if (dirty[path] !== undefined || contents[path] !== undefined) return;
    setLoadingFile(true);
    try {
      const res = await fetch(
        `/api/github/file?repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(path)}&ref=${encodeURIComponent(branch)}`,
        { cache: "no-store" },
      );
      const json = await res.json().catch(() => null);
      setContents((c) => ({
        ...c,
        [path]: res.ok && json?.ok ? json.data.content : `// ${json?.error?.message ?? "couldn't load file"}`,
      }));
    } catch {
      setContents((c) => ({ ...c, [path]: "// couldn't load file" }));
    }
    setLoadingFile(false);
  }

  function newFile() {
    const path = window.prompt('New file path (e.g. "src/app.ts")')?.trim();
    if (!path) return;
    setDirty((d) => ({ ...d, [path]: d[path] ?? "// new file\n" }));
    setFiles((f) => (f.some((x) => x.path === path) ? f : [{ path, size: 0 }, ...f]));
    setSelected(path);
    setPreview(false);
  }

  async function commit() {
    if (!dirtyCount || committing) return;
    setCommitting(true);
    setCommitNote(null);
    try {
      const res = await fetch("/api/github/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo,
          branch,
          message: message.trim() || `Edit ${Object.keys(dirty).join(", ").slice(0, 150)}`,
          files: Object.entries(dirty).map(([path, content]) => ({ path, content })),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setCommitNote(json?.error?.message ?? "Commit failed.");
      } else {
        setContents((c) => ({ ...c, ...dirty }));
        setDirty({});
        setMessage("");
        setCommitNote(`Committed to ${branch} ✓`);
      }
    } catch {
      setCommitNote("Commit failed.");
    }
    setCommitting(false);
  }

  const isHtml = useMemo(() => (selected ?? "").toLowerCase().endsWith(".html"), [selected]);

  return (
    <div className="glass-panel-strong overflow-hidden flex flex-col h-[calc(100vh-14rem)]">
      {/* Top bar: repo + branch + commit */}
      <div className="border-b border-white/[0.06] p-3 flex flex-wrap items-center gap-2">
        <FolderGit2 className="h-4 w-4 text-signal-300 shrink-0" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const target = repoInput.trim();
            if (target) {
              setRepo(target);
              void loadTree(target);
            }
          }}
          className="flex items-center gap-2"
        >
          <input
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            list="repo-options"
            placeholder="owner/repo"
            className="w-64 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-signal-400/50"
          />
          <datalist id="repo-options">
            {repoOptions.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
          <button type="submit" className="btn-signal text-xs" disabled={loadingTree}>
            {loadingTree ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Open"}
          </button>
        </form>
        {branch && (
          <span className="font-mono text-[11px] text-zinc-500">
            on <span className="text-zinc-300">{branch}</span>
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {commitNote && <span className="text-xs text-zinc-400">{commitNote}</span>}
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={dirtyCount ? "Commit message" : "No changes yet"}
            disabled={!dirtyCount}
            className="w-56 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-signal-400/50 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => void commit()}
            disabled={!dirtyCount || committing}
            className="btn-signal text-xs disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {committing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <GitCommitHorizontal className="h-3.5 w-3.5" />}
            Commit {dirtyCount > 0 ? `(${dirtyCount})` : ""}
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* File tree */}
        <aside className="w-64 shrink-0 border-r border-white/[0.06] overflow-y-auto p-2">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Files</span>
            <button
              type="button"
              aria-label="New file"
              onClick={newFile}
              disabled={!branch}
              className="text-zinc-500 hover:text-signal-300 transition-colors disabled:opacity-40"
            >
              <FilePlus2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {treeError ? (
            <p className="px-2 py-1 text-xs text-flare-200">{treeError}</p>
          ) : files.length === 0 && !loadingTree ? (
            <p className="px-2 py-1 text-xs text-zinc-600">Open a repo to browse its files.</p>
          ) : (
            <ul className="space-y-0.5">
              {files.map((f) => (
                <li key={f.path}>
                  <button
                    type="button"
                    onClick={() => void openFile(f.path)}
                    className={cn(
                      "w-full text-left px-2 py-1 rounded-md font-mono text-[11px] truncate transition-colors",
                      selected === f.path
                        ? "bg-signal-400/15 text-signal-200"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]",
                      dirty[f.path] !== undefined && "text-flare-200",
                    )}
                    title={f.path}
                  >
                    {dirty[f.path] !== undefined ? "● " : ""}
                    {f.path}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Editor / preview */}
        <div className="flex-1 min-w-0 flex flex-col">
          {selected && (
            <div className="border-b border-white/[0.06] px-3 py-1.5 flex items-center gap-2">
              <FileCode2 className="h-3.5 w-3.5 text-zinc-500" />
              <span className="font-mono text-[11px] text-zinc-300 truncate">{selected}</span>
              {isHtml && (
                <button
                  type="button"
                  onClick={() => setPreview((v) => !v)}
                  className="ml-auto inline-flex items-center gap-1 text-[11px] font-mono text-vital-300 hover:text-vital-200 transition-colors"
                >
                  {preview ? <X className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  {preview ? "close preview" : "run preview"}
                </button>
              )}
            </div>
          )}
          <div className="flex-1 min-h-0">
            {!selected ? (
              <div className="h-full grid place-items-center text-sm text-zinc-600">
                Select a file to start editing.
              </div>
            ) : loadingFile ? (
              <div className="h-full grid place-items-center text-zinc-500 text-sm">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> loading file…
                </span>
              </div>
            ) : preview && isHtml ? (
              <iframe
                title="HTML preview"
                sandbox="allow-scripts"
                srcDoc={currentContent}
                className="w-full h-full bg-white"
              />
            ) : (
              <Monaco
                key={selected}
                theme="vs-dark"
                language={languageFor(selected)}
                value={currentContent}
                onChange={(value) => {
                  const next = value ?? "";
                  setDirty((d) => {
                    if (next !== contents[selected]) return { ...d, [selected]: next };
                    const rest = { ...d };
                    delete rest[selected];
                    return rest;
                  });
                }}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12 },
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
