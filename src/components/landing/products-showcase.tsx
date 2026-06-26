"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { SectionHeader } from "@/components/shared/section-header";
import { ProductCard } from "@/components/products/product-card";
import { staggerContainer } from "@/lib/motion";

/** Home products showcase — the two flagship products as immersive cards. */
export function ProductsShowcase() {
  return (
    <section className="relative py-24 lg:py-32">
      {/* Section ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-radial-signal opacity-60" />

      <div className="container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Our products"
            title={
              <>
                Two products.{" "}
                <span className="text-gradient-signal">One standard</span>.
              </>
            }
            sub="Each one is real software, in production, built end-to-end — not a concept or a waitlist."
            className="md:max-w-2xl"
          />
          <Link
            href="/products"
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm text-zinc-300 hover:text-white transition-colors"
          >
            All products
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          {PRODUCTS.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
