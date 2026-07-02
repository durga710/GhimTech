"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Check, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Contact form.
 *
 * Real validation via Zod. Tracks submission state with discriminated unions
 * (idle | submitting | success | error) so each state can be rendered
 * exactly once and animated cleanly.
 *
 * Submits to POST /api/contact, which validates (Zod), rate-limits per IP,
 * and stores the message. The operator reads incoming messages in the
 * dashboard Inbox (/dashboard/inbox).
 */

const ContactSchema = z.object({
  name: z.string().min(1, "Your name keeps me from saying 'hey there'."),
  email: z.string().email("That doesn't look like an email."),
  purpose: z.enum(["agency", "partner", "press", "hello", "other"]),
  message: z
    .string()
    .min(10, "A little more context helps — even one sentence.")
    .max(2000, "Keep it under 2000 characters."),
});

type ContactInput = z.infer<typeof ContactSchema>;

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const PURPOSES = [
  { value: "agency", label: "Homecare agency" },
  { value: "partner", label: "Partnership / introduction" },
  { value: "press", label: "Press / media" },
  { value: "hello", label: "Just want to say hi" },
  { value: "other", label: "Something else" },
] as const;

export function ContactForm() {
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(ContactSchema),
    defaultValues: { purpose: "agency" },
  });

  const messageLength = watch("message")?.length ?? 0;

  async function onSubmit(data: ContactInput) {
    setState({ kind: "submitting" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 429) {
        setState({
          kind: "error",
          message: "Too many messages from your network right now. Please try again later.",
        });
        return;
      }

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setState({
          kind: "error",
          message: json?.error?.message ?? "Something went wrong. Please try again.",
        });
        return;
      }

      setState({ kind: "success" });
      reset();
    } catch {
      setState({
        kind: "error",
        message: "Couldn't reach the server. Check your connection and try again.",
      });
    }
  }

  return (
    <section className="relative py-16">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FORM CARD */}
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8 glass-panel-strong p-8 lg:p-10 relative hud-corners"
          >
            <span className="hud-corner-tl" aria-hidden />
            <span className="hud-corner-br" aria-hidden />

            <div className="flex items-center justify-between mb-6">
              <span className="label-tactical">Message · secure transmission</span>
              <span className="font-mono text-[10px] text-zinc-500">/contact</span>
            </div>

            {/* NAME + EMAIL row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <Field label="Your name" error={errors.name?.message}>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Maria Chen"
                  className={inputClass(!!errors.name)}
                />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="maria@agency.com"
                  className={inputClass(!!errors.email)}
                />
              </Field>
            </div>

            {/* PURPOSE — radio-style chip selector */}
            <Field label="What's this about?" error={errors.purpose?.message}>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {PURPOSES.map((p) => (
                  <label
                    key={p.value}
                    className="relative cursor-pointer group"
                  >
                    <input
                      {...register("purpose")}
                      type="radio"
                      value={p.value}
                      className="peer sr-only"
                    />
                    <div
                      className="px-3 py-2.5 rounded-lg text-center text-xs font-medium
                                 bg-white/[0.03] border border-white/10 text-zinc-400
                                 transition-all
                                 peer-checked:bg-signal-400/10 peer-checked:border-signal-400/40 peer-checked:text-signal-200
                                 group-hover:border-white/20"
                    >
                      {p.label}
                    </div>
                  </label>
                ))}
              </div>
            </Field>

            {/* MESSAGE */}
            <Field
              label="Message"
              hint={`${messageLength} / 2000`}
              error={errors.message?.message}
            >
              <textarea
                {...register("message")}
                rows={6}
                placeholder="Tell me what's on your mind. Context is helpful — what you're working on, what's stuck, what you're hoping to figure out."
                className={cn(inputClass(!!errors.message), "resize-none")}
              />
            </Field>

            {/* SUBMIT */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-zinc-500 max-w-md">
                I read every message. Replies usually come within 1-2 days. Encrypted
                transmission, never shared.
              </p>

              <SubmitButton state={state} />
            </div>

            {/* STATE MESSAGES */}
            <AnimatePresence>
              {state.kind === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 flex items-start gap-3 p-4 rounded-lg
                             bg-vital-400/5 border border-vital-400/30 text-vital-200"
                >
                  <Check className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="text-sm leading-relaxed">
                    <strong className="text-white">Sent.</strong> Thanks for writing. I&apos;ll
                    get back to you within a day or two.
                  </div>
                </motion.div>
              )}
              {state.kind === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 flex items-start gap-3 p-4 rounded-lg
                             bg-critical-500/5 border border-critical-500/30 text-critical-400"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="text-sm leading-relaxed">{state.message}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>

          {/* SIDE PANEL — availability & methods */}
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4 space-y-4"
          >
            <AvailabilityCard />
            <MethodsCard />
          </motion.aside>
        </div>
      </div>
    </section>
  );
}

/* ============ Field wrapper ============ */
interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}
function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-2">
        <span className="label-tactical">{label}</span>
        {hint && <span className="font-mono text-[10px] text-zinc-500">{hint}</span>}
      </div>
      {children}
      {error && (
        <div className="mt-1.5 text-xs text-critical-400 font-medium">{error}</div>
      )}
    </label>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    "w-full px-4 py-3 rounded-lg",
    "bg-white/[0.03] border text-white placeholder:text-zinc-600",
    "transition-colors",
    "focus:outline-none focus:bg-white/[0.05]",
    hasError
      ? "border-critical-500/50 focus:border-critical-500"
      : "border-white/10 focus:border-signal-400/50"
  );
}

/* ============ Submit button ============ */
function SubmitButton({ state }: { state: SubmitState }) {
  return (
    <button
      type="submit"
      disabled={state.kind === "submitting"}
      className="btn-signal group disabled:opacity-60 disabled:cursor-not-allowed min-w-[180px] justify-center"
    >
      {state.kind === "submitting" ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Sending…
        </>
      ) : state.kind === "success" ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Sent
        </>
      ) : (
        <>
          <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          Send message
        </>
      )}
    </button>
  );
}

/* ============ Side cards ============ */
function AvailabilityCard() {
  return (
    <div className="glass-panel-strong p-6 relative hud-corners">
      <span className="hud-corner-tl" aria-hidden />
      <span className="hud-corner-br" aria-hidden />

      <div className="flex items-center justify-between mb-4">
        <span className="label-tactical">Availability</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-vital-300">
          <span className="status-dot status-dot-live" />
          Active
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500 tracking-tactical">REPLY TIME</span>
          <span className="text-zinc-200">~1-2 days</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500 tracking-tactical">TIMEZONE</span>
          <span className="text-zinc-200">US Eastern</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500 tracking-tactical">CALENDAR</span>
          <span className="text-zinc-200">By request</span>
        </div>
      </div>

      <div className="hairline my-5" />

      <p className="text-xs text-zinc-400 leading-relaxed">
        Currently focused on shipping RayHealth. Open to short conversations with
        agencies and people working on adjacent problems.
      </p>
    </div>
  );
}

function MethodsCard() {
  return (
    <div className="glass-panel-strong p-6">
      <span className="label-tactical">Other ways to reach me</span>
      <ul className="mt-4 space-y-3">
        {[
          { label: "Direct email", value: "durga@rayhealthevv.com", href: "mailto:durga@rayhealthevv.com" },
          { label: "Personal", value: "via this form ↑", href: null },
          { label: "RayHealth", value: "rayhealthevv.com", href: "https://rayhealthevv.com" },
        ].map((m) => (
          <li key={m.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-zinc-500">{m.label}</span>
            {m.href ? (
              <a
                href={m.href}
                target={m.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="text-signal-300 hover:text-signal-200 font-medium transition-colors truncate"
              >
                {m.value}
              </a>
            ) : (
              <span className="text-zinc-300 font-medium">{m.value}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
