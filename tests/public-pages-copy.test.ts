import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

describe("public page copy", () => {
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
