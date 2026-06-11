"use client";

import { useState } from "react";
import { BrainCircuit, Github, Loader2, Check, AlertTriangle } from "lucide-react";

const MODEL_PRESETS: Record<string, { label: string; models: string[]; hint: string }> = {
  openai: {
    label: "OpenAI",
    models: ["gpt-5", "gpt-5-mini", "gpt-4.1"],
    hint: "Uses the workspace OPENAI_API_KEY. Includes built-in web search.",
  },
  anthropic: {
    label: "Anthropic (Claude)",
    models: ["claude-sonnet-4-6", "claude-opus-4-8", "claude-haiku-4-5-20251001"],
    hint: "Strong agentic tool use. Needs ANTHROPIC_API_KEY in Vercel env vars.",
  },
  local: {
    label: "Local / self-hosted",
    models: ["llama3.1", "qwen2.5-coder:14b", "mistral"],
    hint: "Any OpenAI-compatible server (Ollama, LM Studio, vLLM). The URL must be reachable from the internet — a tunnel, not localhost on your laptop.",
  },
};

interface Props {
  initial: {
    aiProvider: string;
    aiModel: string;
    aiBaseUrl: string;
    githubTokenSet: boolean;
    aiApiKeySet: boolean;
  };
  anthropicAvailable: boolean;
}

async function patchPreferences(body: Record<string, unknown>): Promise<string | null> {
  try {
    const res = await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) return json?.error?.message ?? "Couldn't save.";
    return null;
  } catch {
    return "Network error.";
  }
}

/**
 * Settings cards for the AI brain (provider + model, incl. local) and the
 * member's own GitHub identity (their PAT → commits/PRs from their account).
 */
export function IntegrationsSettings({ initial, anthropicAvailable }: Props) {
  const [provider, setProvider] = useState(initial.aiProvider);
  const [model, setModel] = useState(initial.aiModel);
  const [baseUrl, setBaseUrl] = useState(initial.aiBaseUrl);
  const [apiKey, setApiKey] = useState("");
  const [apiKeySet, setApiKeySet] = useState(initial.aiApiKeySet);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  const [tokenSet, setTokenSet] = useState(initial.githubTokenSet);
  const [token, setToken] = useState("");
  const [ghSaving, setGhSaving] = useState(false);
  const [ghNote, setGhNote] = useState<string | null>(null);

  const preset = MODEL_PRESETS[provider] ?? MODEL_PRESETS.openai;

  async function saveAi() {
    setAiSaving(true);
    setAiNote(null);
    const err = await patchPreferences({
      aiProvider: provider,
      aiModel: model,
      ...(provider === "local" ? { aiBaseUrl: baseUrl } : {}),
      ...(apiKey.trim() ? { aiApiKey: apiKey.trim() } : {}),
    });
    if (!err && apiKey.trim()) {
      setApiKeySet(true);
      setApiKey("");
    }
    setAiNote(err ?? "Saved — chats use this model from now on.");
    setAiSaving(false);
  }

  async function saveGithub(clear: boolean) {
    setGhSaving(true);
    setGhNote(null);
    const err = await patchPreferences({ githubToken: clear ? "" : token.trim() });
    if (!err) {
      setTokenSet(!clear);
      setToken("");
      setGhNote(clear ? "Removed — back to the workspace token." : "Connected — commits now come from your account.");
    } else {
      setGhNote(err);
    }
    setGhSaving(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* AI model */}
      <section className="glass-panel p-5 space-y-4">
        <header className="flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-lg grid place-items-center bg-signal-400/10 border border-signal-400/20">
            <BrainCircuit className="h-4 w-4 text-signal-300" />
          </span>
          <div>
            <h2 className="text-sm font-medium text-white">AI model</h2>
            <p className="text-xs text-zinc-500">The brain behind GCODE and the Copilot.</p>
          </div>
        </header>

        <div className="space-y-3">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-600 mb-1.5">
              Provider
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(MODEL_PRESETS).map(([key, p]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setProvider(key);
                    setModel(MODEL_PRESETS[key].models[0]);
                  }}
                  className={
                    provider === key
                      ? "px-3 py-1.5 rounded-lg text-xs border border-signal-400/50 bg-signal-400/15 text-signal-200"
                      : "px-3 py-1.5 rounded-lg text-xs border border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20 transition-colors"
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-600 mb-1.5">
              Model
            </label>
            <div className="flex gap-2">
              <select
                value={preset.models.includes(model) ? model : "__custom"}
                onChange={(e) => e.target.value !== "__custom" && setModel(e.target.value)}
                className="bg-white/[0.03] border border-white/10 rounded-lg px-2 py-2 font-mono text-xs text-white focus:outline-none focus:border-signal-400/50"
              >
                {preset.models.map((m) => (
                  <option key={m} value={m} className="bg-ink-950">
                    {m}
                  </option>
                ))}
                <option value="__custom" className="bg-ink-950">
                  custom…
                </option>
              </select>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="model id"
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-signal-400/50"
              />
            </div>
          </div>

          {provider === "local" && (
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-600 mb-1.5">
                Server URL (OpenAI-compatible)
              </label>
              <input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://my-tunnel.example.com/v1"
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-signal-400/50"
              />
            </div>
          )}

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-600 mb-1.5">
              Your API key {apiKeySet && <span className="text-vital-300 normal-case">· connected</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={apiKeySet ? "key saved — paste to replace" : "sk-… (used instead of the workspace key)"}
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-signal-400/50"
              />
              {apiKeySet && (
                <button
                  type="button"
                  onClick={async () => {
                    const err = await patchPreferences({ aiApiKey: "" });
                    if (!err) {
                      setApiKeySet(false);
                      setAiNote("Key removed — back to the workspace key.");
                    }
                  }}
                  className="text-xs text-zinc-500 hover:text-flare-200 transition-colors shrink-0"
                >
                  remove
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-zinc-500">{preset.hint}</p>
          {provider === "anthropic" && !anthropicAvailable && !apiKeySet && (
            <p className="flex items-center gap-1.5 text-xs text-flare-200">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              No Anthropic key yet — paste yours above, or set ANTHROPIC_API_KEY in Vercel.
            </p>
          )}

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => void saveAi()} disabled={aiSaving} className="btn-signal text-xs disabled:opacity-50">
              {aiSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save model"}
            </button>
            {aiNote && <span className="text-xs text-zinc-400">{aiNote}</span>}
          </div>
        </div>
      </section>

      {/* GitHub identity */}
      <section className="glass-panel p-5 space-y-4">
        <header className="flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-lg grid place-items-center bg-white/[0.06] border border-white/10">
            <Github className="h-4 w-4 text-zinc-200" />
          </span>
          <div>
            <h2 className="text-sm font-medium text-white">GitHub identity</h2>
            <p className="text-xs text-zinc-500">
              Connect your own token so commits and PRs come from <em>your</em> account.
            </p>
          </div>
        </header>

        <p className="flex items-center gap-1.5 text-xs">
          {tokenSet ? (
            <>
              <Check className="h-3.5 w-3.5 text-vital-300" />
              <span className="text-vital-200">Your token is connected — GCODE and the editor act as you.</span>
            </>
          ) : (
            <span className="text-zinc-500">
              Using the workspace token — commits appear from the workspace owner&apos;s account.
            </span>
          )}
        </p>

        <div className="space-y-2">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="github_pat_… or ghp_… (fine-grained, Contents + Pull requests read/write)"
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-signal-400/50"
          />
          <p className="text-[11px] text-zinc-600">
            Create one at GitHub → Settings → Developer settings → Fine-grained tokens. Grant the repos
            you&apos;ll build into, with Contents and Pull requests read &amp; write.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void saveGithub(false)}
              disabled={ghSaving || !token.trim()}
              className="btn-signal text-xs disabled:opacity-50"
            >
              {ghSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Connect token"}
            </button>
            {tokenSet && (
              <button
                type="button"
                onClick={() => void saveGithub(true)}
                disabled={ghSaving}
                className="text-xs text-zinc-500 hover:text-flare-200 transition-colors"
              >
                Remove my token
              </button>
            )}
            {ghNote && <span className="text-xs text-zinc-400">{ghNote}</span>}
          </div>
        </div>
      </section>
    </div>
  );
}
