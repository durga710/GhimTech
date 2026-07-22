"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { PRODUCTS } from "@/lib/content";
import { ScreenshotFrame } from "@/components/marketing/screenshot-frame";

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
  return (
    <motion.article
      className={`surface-premium group grid gap-10 p-6 lg:p-10 ${featured ? "lg:grid-cols-[0.72fr_1.28fr] lg:items-center" : ""}`}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="control-chip">{product.status}</span>
          <span className="text-xs font-medium text-slate-500">{product.tag}</span>
        </div>
        <h3 className="mt-5 text-balance font-display text-3xl leading-none tracking-tight text-slate-950 lg:text-4xl">
          {product.name}
        </h3>
        <p className="mt-2 text-base font-medium text-slate-700">{product.tagline}</p>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-600">{product.description}</p>

        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {product.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          {product.stack.map((item) => (
            <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
              {item}
            </span>
          ))}
        </div>

        <Link
          href={product.href}
          className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-900"
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
