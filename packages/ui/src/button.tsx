"use client";
import type { ButtonHTMLAttributes } from "react";
import { cx } from "./cx";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";

const styles: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 shadow-sm shadow-brand-900/20 disabled:bg-slate-300 dark:disabled:bg-slate-700",
  secondary:
    "border border-slate-300 bg-white text-slate-800 hover:border-brand-400 hover:text-brand-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800",
  danger: "bg-rose-600 text-white hover:bg-rose-700 disabled:bg-slate-300",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" }) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed",
        size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-sm",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
