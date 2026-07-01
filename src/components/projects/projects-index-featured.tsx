"use client";

import { motion } from "framer-motion";
import { PRODUCTS } from "@/lib/content";
import { ProductCard } from "@/components/marketing/product-card";
import { fadeUp, staggerContainer } from "@/lib/motion";

/**
 * Projects index portfolio — the full product roster as premium cards.
 * RayHealthEVV links to its product page; Helix Studio routes to contact.
 */
export function ProjectsIndexFeatured() {
  return (
    <section className="relative pb-32">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="label-tactical mb-6">
            Product portfolio
          </motion.div>

          <motion.div variants={fadeUp} className="grid gap-6">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.slug} product={product} featured />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
