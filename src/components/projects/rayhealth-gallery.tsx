"use client";

import { motion } from "framer-motion";
import { RAYHEALTH_GALLERY } from "@/lib/content";
import { ScreenshotFrame } from "@/components/marketing/screenshot-frame";
import { SectionHeader } from "@/components/shared/section-header";

/**
 * Real product screenshots from the live RayHealthEVV application —
 * admin Command Center, Visit Review, Compliance Engine, Caregiver Portal.
 * No mockups: every frame is a capture of rayhealthevv.com in production.
 */
export function RayHealthGallery() {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="container">
        <SectionHeader
          eyebrow="Inside the product"
          title="The real surfaces, in production"
          sub="Captured directly from the live application — the same screens agency owners and caregivers use every day."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {RAYHEALTH_GALLERY.map((shot, index) => (
            <motion.figure
              key={shot.src}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="min-w-0"
            >
              <ScreenshotFrame src={shot.src} alt={shot.alt} url={shot.url} />
              <figcaption className="mt-4 px-1">
                <span className="text-sm font-medium text-white">{shot.title}</span>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">{shot.body}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
