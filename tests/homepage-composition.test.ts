import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

const page = readFileSync("src/app/page.tsx", "utf8");

describe("homepage composition", () => {
  it("includes the Serious Work OS homepage sections", () => {
    assert.match(page, /SignalStrip/);
    assert.match(page, /TechnologyGrid/);
    assert.match(page, /FounderPanel/);
  });
});
