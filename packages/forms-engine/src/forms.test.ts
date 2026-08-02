import { describe, expect, it } from "vitest";
import { mfjFamilyReturn, singleW2Return } from "@ghimtech/testing";
import { calculateFederal } from "@ghimtech/tax-engine-federal";
import { calculatePennsylvania } from "@ghimtech/tax-engine-pennsylvania";
import { buildForm1040, buildPa40, buildReturnPackage } from "./mappers.js";
import { renderFormHtml } from "./render.js";
import { snapshotHash } from "./snapshot.js";

function snapshot(model = singleW2Return()) {
  return {
    model,
    federal: calculateFederal(model),
    pennsylvania: calculatePennsylvania(model),
  };
}

describe("form mapping", () => {
  it("maps Form 1040 lines from the federal result", () => {
    const snap = snapshot();
    const form = buildForm1040(snap.model, snap.federal, "DRAFT");
    const flat = form.sections.flatMap((s) => s.lines);
    expect(flat.find((l) => l.line === "11")?.value).toBe(60_000);
    expect(flat.find((l) => l.line === "15")?.value).toBe(44_250);
    expect(flat.find((l) => l.line === "16")?.value).toBe(5_075);
    expect(flat.find((l) => l.line === "34")?.value).toBe(925);
  });

  it("masks all identifiers", () => {
    const snap = snapshot(mfjFamilyReturn());
    const form = buildForm1040(snap.model, snap.federal, "CLIENT_COPY");
    expect(form.taxpayerTinMasked).toBe("***-**-0001");
    expect(form.spouseTinMasked).toBe("***-**-0002");
    const rendered = renderFormHtml(form);
    expect(rendered).not.toMatch(/\d{3}-\d{2}-\d{4}/);
  });

  it("maps PA-40 lines", () => {
    const snap = snapshot();
    const form = buildPa40(snap.model, snap.pennsylvania, "REVIEW_COPY");
    const flat = form.sections.flatMap((s) => s.lines);
    expect(flat.find((l) => l.line === "9")?.value).toBe(60_000);
    expect(flat.find((l) => l.line === "12")?.value).toBe(1_842);
  });

  it("builds a package with authorization document and stable snapshot hash", () => {
    const snap = snapshot();
    const pkg = buildReturnPackage(snap, "CLIENT_COPY");
    expect(pkg.documents.map((d) => d.formId)).toEqual(["1040", "PA-40", "GHIMTECH-AUTH"]);
    expect(pkg.snapshotHash).toBe(snapshotHash(snap));
    expect(pkg.snapshotHash).toHaveLength(64);
  });

  it("changes the snapshot hash when the model materially changes", () => {
    const a = snapshotHash(snapshot());
    const changed = singleW2Return();
    changed.w2s[0]!.wages += 100;
    const b = snapshotHash({
      model: changed,
      federal: calculateFederal(changed),
      pennsylvania: calculatePennsylvania(changed),
    });
    expect(a).not.toBe(b);
  });

  it("is insensitive to object key order (canonical hashing)", () => {
    const snap = snapshot();
    const reordered = JSON.parse(JSON.stringify(snap));
    expect(snapshotHash(reordered)).toBe(snapshotHash(snap));
  });
});

describe("rendering", () => {
  it("renders watermarks for drafts and none for filing copies", () => {
    const snap = snapshot();
    const draft = renderFormHtml(buildForm1040(snap.model, snap.federal, "DRAFT"));
    expect(draft).toContain("DRAFT — NOT FOR FILING");
    const filing = renderFormHtml(buildForm1040(snap.model, snap.federal, "FILING_COPY"));
    expect(filing).not.toContain('watermark">');
  });

  it("escapes HTML in user-controlled fields", () => {
    const model = singleW2Return();
    model.taxpayer = {
      ...model.taxpayer,
      name: { firstName: "<script>alert(1)</script>", lastName: "X" },
    };
    const html = renderFormHtml(buildForm1040(model, calculateFederal(model), "DRAFT"));
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
