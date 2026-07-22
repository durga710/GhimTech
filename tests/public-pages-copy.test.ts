import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

describe("public page copy", () => {
  it("applies the shared light system to every public route", () => {
    const routes = [
      "src/app/about/page.tsx",
      "src/app/contact/page.tsx",
      "src/app/experience/page.tsx",
      "src/app/projects/page.tsx",
      "src/app/projects/rayhealth-evv/page.tsx",
    ];

    for (const route of routes) {
      assert.match(readFileSync(route, "utf8"), /public-shell/);
    }
  });

  it("keeps both auth pages in the same light editorial color system", () => {
    for (const route of [
      "src/app/sign-in/[[...sign-in]]/page.tsx",
      "src/app/sign-up/[[...sign-up]]/page.tsx",
    ]) {
      const source = readFileSync(route, "utf8");
      assert.match(source, /auth-shell/);
      assert.match(source, /text-slate-950/);
      assert.match(source, /border-slate-300/);
      assert.doesNotMatch(source, /bg-ink|text-white|text-zinc|border-white|text-vital|text-signal/);
    }
  });

  it("keeps contact framed for serious software conversations", () => {
    const contactIntro = readFileSync("src/components/contact/contact-intro.tsx", "utf8");
    assert.match(contactIntro, /agency owners|partners|engineers|technical buyers/i);
  });

  it("keeps RayHealth compliance wording conservative", () => {
    const rayhealthPage = readFileSync("src/app/projects/rayhealth-evv/page.tsx", "utf8");
    assert.match(rayhealthPage, /Designed to support EVV/i);
    assert.doesNotMatch(rayhealthPage, /certified|audit-proof|guaranteed/i);
  });
});
