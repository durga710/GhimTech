import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

describe("dashboard surface", () => {
  it("uses the calmer operating console language", () => {
    const header = readFileSync("src/components/dashboard/dashboard-page-header.tsx", "utf8");
    assert.match(header, /operating-console|surface-subtle|surface-premium/);
  });

  it("keeps dashboard layout private and does not add public nav", () => {
    const layout = readFileSync("src/app/dashboard/layout.tsx", "utf8");
    assert.doesNotMatch(layout, /TopNav/);
    assert.match(layout, /DashboardSidebar/);
  });
});
