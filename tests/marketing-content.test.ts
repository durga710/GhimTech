import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import {
  COMPANY,
  FOUNDER,
  HOME_SIGNALS,
  NAV,
  PRODUCTS,
  TECHNOLOGY_PILLARS,
} from "../src/lib/content";

describe("marketing content model", () => {
  it("positions GhimTech as an AI-native software company", () => {
    assert.match(COMPANY.positioning, /AI-native software/i);
    assert.match(COMPANY.tagline, /serious work/i);
  });

  it("includes RayHealthEVV and Helix Studio as product roster entries", () => {
    assert.deepEqual(
      PRODUCTS.map((product) => product.name),
      ["RayHealthEVV™", "Helix Studio"]
    );
  });

  it("keeps RayHealth compliance language conservative", () => {
    const rayhealth = PRODUCTS.find((product) => product.slug === "rayhealth-evv");
    assert.ok(rayhealth);
    assert.match(rayhealth.description, /designed to support/i);
    assert.doesNotMatch(rayhealth.description, /certified|audit-proof|guaranteed/i);
  });

  it("models Helix without fake scale or customer claims", () => {
    const helix = PRODUCTS.find((product) => product.slug === "helix-studio");
    assert.ok(helix);
    assert.match(helix.description, /plain-language prompts/i);
    assert.doesNotMatch(helix.description, /customers|revenue|enterprise deployments|99\.9/i);
  });

  it("uses only working routes or homepage anchors in the public nav", () => {
    assert.deepEqual(
      NAV.map((item) => item.href),
      ["/#products", "/#technology", "/about", "/contact", "/dashboard"]
    );
  });

  it("has enough signals and technology pillars to build the homepage", () => {
    assert.equal(HOME_SIGNALS.length >= 5, true);
    assert.equal(TECHNOLOGY_PILLARS.length >= 6, true);
    assert.equal(FOUNDER.shortBio.includes("USMC Veteran"), true);
  });
});

// layout.tsx cannot be imported under the plain node test runner (it pulls in
// globals.css and next/font), so metadata is asserted from source text instead.
describe("root metadata", () => {
  it("uses the new company positioning in SEO metadata", () => {
    const layout = readFileSync("src/app/layout.tsx", "utf8");
    assert.match(layout, /description:\s*COMPANY\.positioning/);
    assert.match(layout, /new URL\("https:\/\/ghimtech\.org"\)/);
    assert.match(COMPANY.positioning, /AI-native software company/i);
  });
});
