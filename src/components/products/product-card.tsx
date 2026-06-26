"use client";

import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { ProductSummary } from "@/lib/products";
import { fadeUp } from "@/lib/motion";

interface ProductCardProps {
  product: ProductSummary;
}

/**
 * Reusable product card with a cursor-tracking glow.
 * Used by the home showcase and the /products index.
 */
export function ProductCard({ product }: ProductCardProps) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const glow = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, ${
    product.accent === "vital" ? "rgba(31,226,148,0.10)" : "rgba(58,164,255,0.12)"
  }, transparent 60%)`;

  const accentText = product.accent === "vital" ? "text-vital-300" : "text-signal-300";

  return (
    <motion.div variants={fadeUp}>
      <Link
        href={product.href}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(e.clientX - r.left);
          my.set(e.clientY - r.top);
        }}
        className="group relative block overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-800/40 p-7 backdrop-blur-xl transition-colors hover:border-white/20"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glow }}
        />

        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="pill">
              <span
                className={`status-dot ${product.accent === "vital" ? "status-dot-live" : "status-dot-signal"}`}
              />
              {product.status}
            </span>
            <ArrowUpRight
              size={18}
              className="text-zinc-500 transition-all group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>

          <div className="mt-6">
            <div className={`font-mono text-xs uppercase tracking-tactical ${accentText}`}>
              {product.category}
            </div>
            <h3 className="mt-2 font-display text-title text-white">{product.name}</h3>
            <p className={`mt-1 text-sm font-medium ${accentText}`}>{product.tagline}</p>
          </div>

          <p className="mt-4 text-sm text-zinc-400 leading-relaxed">{product.oneLiner}</p>

          <ul className="mt-5 space-y-2">
            {product.highlights.slice(0, 4).map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-sm text-zinc-300">
                <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${product.accent === "vital" ? "bg-vital-400" : "bg-signal-400"}`} />
                {h}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-2">
            {product.stack.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
