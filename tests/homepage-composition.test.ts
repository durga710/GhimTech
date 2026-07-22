import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

const page = readFileSync("src/app/page.tsx", "utf8");
const featuredProject = readFileSync("src/components/landing/featured-project.tsx", "utf8");
const productCard = readFileSync("src/components/marketing/product-card.tsx", "utf8");
const hero = readFileSync("src/components/landing/hero.tsx", "utf8");
const screenshotFrame = readFileSync("src/components/marketing/screenshot-frame.tsx", "utf8");
const globals = readFileSync("src/app/globals.css", "utf8");

describe("homepage composition", () => {
  it("uses a calm, editorial homepage composition", () => {
    assert.doesNotMatch(page, /SignalStrip/);
    assert.match(page, /TechnologyGrid/);
    assert.match(page, /FounderPanel/);
    assert.doesNotMatch(hero, /rotate-|ScreenshotFrame/);
  });

  it("eager-loads the repeated RayHealth preview used by the homepage LCP image", () => {
    assert.match(productCard, /priority\?: boolean/);
    assert.match(productCard, /priority=\{priority\}/);
    assert.match(featuredProject, /priority=\{index === 0\}/);
  });

  it("shows product UI without cropping or decorative browser chrome", () => {
    assert.match(screenshotFrame, /object-contain/);
    assert.match(screenshotFrame, /data-screenshot-treatment="contained"/);
    assert.doesNotMatch(screenshotFrame, /address bar|rounded-full bg-white/);
  });

  it("removes the futuristic HUD and glow vocabulary from the global system", () => {
    assert.doesNotMatch(globals, /radial-gradient|backdrop-blur|shadow-glow|animate-pulse/);
    assert.match(globals, /--surface:/);
    assert.match(globals, /--accent:/);
  });
});
