import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function THead({ columns }: { columns: string[] }) {
  return (
    <thead>
      <tr className="border-b border-slate-200 dark:border-slate-700">
        {columns.map((column) => (
          <th
            key={column}
            className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400"
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function TRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cx(
        "border-b border-slate-100 last:border-0 hover:bg-slate-50/70 dark:border-slate-700/60 dark:hover:bg-slate-700/30",
        className,
      )}
      {...props}
    />
  );
}

export function TCell({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cx("px-4 py-2.5 align-middle text-slate-700 dark:text-slate-200", className)}
      {...props}
    />
  );
}
