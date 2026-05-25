import type { Metadata } from "next";
import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { ContactIntro } from "@/components/contact/contact-intro";
import { ContactForm } from "@/components/contact/contact-form";
import { WorldMap } from "@/components/contact/world-map";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Send Durga a message. Open to conversations with homecare agencies, partners, and people working on adjacent problems.",
  openGraph: {
    title: "Contact · Durga Ghimeray",
    description: "Open to conversations. Send a message.",
    url: "https://ghimtech.org/contact",
  },
};

/**
 * Contact page composition.
 *
 *   1. Intro — short, warm, honest
 *   2. Form — Zod-validated react-hook-form with submission states
 *   3. World map — stylized SVG dot-matrix with Nepal → US arc
 *
 * No closing CTA — the form IS the CTA.
 */
export default function ContactPage() {
  return (
    <main className="relative overflow-x-clip">
      <TopNav />
      <ContactIntro />
      <ContactForm />
      <WorldMap />
      <SiteFooter />
    </main>
  );
}
