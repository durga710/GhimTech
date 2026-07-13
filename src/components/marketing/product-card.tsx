"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { PRODUCTS } from "@/lib/content";
import { ScreenshotFrame } from "@/components/marketing/screenshot-frame";
import { cn } from "@/lib/utils";

type Product = (typeof PRODUCTS)[number];

export function ProductCard({
  product,
  featured = false,
  priority = false,
}: {
  product: Product;
  featured?: boolean;
  priority?: boolean;
}) {
  const isVital = product.accent === "vital";

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className={cn(
        "surface-premium group grid gap-7 p-6 lg:p-7",
        featured && "lg:grid-cols-[1.05fr_0.95fr]",
        isVital ? "hover:border-vital-300/25" : "hover:border-signal-300/25"
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("control-chip", isVital && "text-vital-200")}>{product.status}</span>
          <span className="label-tactical">{product.tag}</span>
        </div>
        <h3 className="mt-5 text-balance font-display text-3xl leading-none tracking-tight text-white lg:text-4xl">
          {product.name}
        </h3>
        <p className="mt-2 text-base font-medium text-zinc-200">{product.tagline}</p>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-400">{product.description}</p>

        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {product.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-zinc-300">
              <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", isVital ? "text-vital-300" : "text-signal-300")} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          {product.stack.map((item) => (
            <span key={item} className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-xs text-zinc-300">
              {item}
            </span>
          ))}
        </div>

        <Link
          href={product.href}
          className={cn("mt-7 inline-flex items-center gap-2 text-sm font-medium transition-colors", isVital ? "text-vital-300 hover:text-vital-200" : "text-signal-300 hover:text-signal-200")}
        >
          {product.cta}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <ProductPreview product={product} priority={priority} />
    </motion.article>
  );
}

export function ProductPreview({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <ScreenshotFrame
      src={product.screenshot.src}
      alt={product.screenshot.alt}
      url={product.screenshot.url}
      priority={priority}
      className="self-center"
    />
  );
}
