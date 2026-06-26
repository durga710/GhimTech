"use client";

import { motion } from "framer-motion";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/products/product-card";
import { blurIn, fadeUp, staggerContainer } from "@/lib/motion";

/** Products index — header + the full product grid. */
export function ProductsIndex() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-40 pb-12 lg:pt-48">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-radial-signal opacity-70" />
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl">
            <motion.span variants={fadeUp} className="eyebrow">
              Products
            </motion.span>
            <motion.h1 variants={blurIn} className="mt-5 font-display text-hero text-white text-balance">
              Software we&apos;d <span className="text-gradient-signal">stake our name on</span>.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
              Every GhimTech product ships to production, holds to the same engineering standard, and earns
              its place in real work. No vaporware, no waitlists.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="container pb-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          {PRODUCTS.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </motion.div>
      </section>
    </>
  );
}
