import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

const page = readFileSync("src/app/page.tsx", "utf8");
const featuredProject = readFileSync("src/components/landing/featured-project.tsx", "utf8");
const productCard = readFileSync("src/components/marketing/product-card.tsx", "utf8");

describe("homepage composition", () => {
  it("includes the Serious Work OS homepage sections", () => {
    assert.match(page, /SignalStrip/);
    assert.match(page, /TechnologyGrid/);
    assert.match(page, /FounderPanel/);
  });

  it("eager-loads the repeated RayHealth preview used by the homepage LCP image", () => {
    assert.match(productCard, /priority\?: boolean/);
    assert.match(productCard, /priority=\{priority\}/);
    assert.match(featuredProject, /priority=\{index === 0\}/);
  });
});
