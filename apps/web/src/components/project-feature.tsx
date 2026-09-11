import Link from "next/link";
import { Eyebrow, Action } from "./primitives";
export function ProjectFeature() {
  return (
    <section className="project-feature">
      <div className="container">
        <div className="feature-top">
          <Eyebrow>Selected work / 01</Eyebrow>
          <span>HOME CARE OPERATIONS</span>
        </div>
        <div className="feature-grid">
          <div>
            <h2>
              The systems
              <br />
              behind the care.
            </h2>
            <p className="feature-company">CyanjelHomeCare LLC</p>
            <p>
              An operating business. An ongoing technology relationship. Software built around the
              people and processes behind home care.
            </p>
            <Action href="/work/cyanjel-homecare" secondary>
              Explore the Case Study
            </Action>
          </div>
          <Link
            className="customer-visual"
            href="/work/cyanjel-homecare"
            aria-label="Explore CyanjelHomeCare’s operational system"
          >
            <div className="customer-visual-top">
              <span>
                CyanjelHomeCare
                <br />
                LLC
              </span>
            </div>
            <div className="customer-flow">
              <span>People</span>
              <i />
              <span>Processes</span>
              <i />
              <span>Technology</span>
            </div>
            <div className="customer-visual-bottom">
              <span>
                <span className="status-dot" />
                Fully powered by GhimTech
              </span>
              <span aria-hidden="true">↗</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
