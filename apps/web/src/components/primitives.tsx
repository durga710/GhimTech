import Link from "next/link";
import { contactEmail } from "@/lib/site";
import type { ReactNode } from "react";
export function Action({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link className={secondary ? "text-link" : "button"} href={href}>
      {children}
      <span aria-hidden="true">↗</span>
    </Link>
  );
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow">
      <span aria-hidden="true" />
      {children}
    </p>
  );
}
export function PageIntro({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <section className="container page-intro">
      <Eyebrow>{label}</Eyebrow>
      <h1>{title}</h1>
      {children && <div className="intro-copy">{children}</div>}
    </section>
  );
}
export function ProjectCTA() {
  return (
    <section className="cta">
      <div className="container cta-inner">
        <div>
          <Eyebrow>A better way to operate</Eyebrow>
          <h2>
            Tell us what’s slowing
            <br className="desktop-break" /> your business down.
          </h2>
          <p>
            A spreadsheet. A handoff. A process that needs too much follow-up.
            <br className="desktop-break" /> That’s a useful place to start.
          </p>
        </div>
        <Action href="/contact">Start a Project</Action>
      </div>
    </section>
  );
}
export function Footer() {
  return (
    <footer className="footer container">
      <div className="footer-top">
        <div>
          <Link className="footer-brand" href="/">
            GhimTech.
          </Link>
          <p>We build the systems behind the business.</p>
        </div>
        <nav aria-label="Footer navigation">
          {[
            ["Work", "/work"],
            ["Services", "/services"],
            ["About", "/about"],
            ["Insights", "/insights"],
            ["Start a Project", "/contact"],
          ].map(([n, h]) => (
            <Link key={h} href={h}>
              {n}
            </Link>
          ))}
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} GhimTech</span>
        <div>
          <a href={"mailto:" + contactEmail}>{contactEmail}</a>
          <a href="https://github.com/durga710">GitHub ↗</a>
          <Link href="/privacy">Privacy</Link>
          <span>Built by GhimTech.</span>
        </div>
      </div>
    </footer>
  );
}
