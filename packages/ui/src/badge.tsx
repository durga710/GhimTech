import type { ReactNode } from "react";
import { cx } from "./cx";

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "brand";

const tones: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300",
  info: "bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  danger: "bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-200",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONES: Record<string, Tone> = {
  DRAFT: "neutral",
  INCOMPLETE: "neutral",
  READY_FOR_PREPARER_REVIEW: "info",
  PREPARER_REVIEWED: "info",
  READY_FOR_REVIEWER: "info",
  REVIEW_CHANGES_REQUESTED: "warning",
  APPROVED: "brand",
  AWAITING_CLIENT_REVIEW: "warning",
  AWAITING_SIGNATURE: "warning",
  SIGNED: "brand",
  READY_TO_EFILE: "brand",
  VALIDATING: "info",
  VALIDATION_FAILED: "danger",
  QUEUED_FOR_TRANSMISSION: "info",
  TRANSMITTING: "info",
  TRANSMITTED: "info",
  ACKNOWLEDGMENT_PENDING: "info",
  ACCEPTED: "success",
  REJECTED: "danger",
  CORRECTION_REQUIRED: "danger",
  RESUBMISSION_READY: "warning",
  RESUBMITTED: "info",
  ARCHIVED: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONES[status] ?? "neutral"}>{status.replaceAll("_", " ")}</Badge>;
}

export function SeverityBadge({ severity }: { severity: "ERROR" | "WARNING" | "INFO" | string }) {
  const tone: Tone = severity === "ERROR" ? "danger" : severity === "WARNING" ? "warning" : "info";
  return <Badge tone={tone}>{severity}</Badge>;
}
