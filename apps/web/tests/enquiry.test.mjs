import test from "node:test";
import assert from "node:assert/strict";
import { validateEnquiry } from "../src/lib/enquiry.mjs";
const valid = {
  name: "Sam",
  email: "sam@example.com",
  company: "Example",
  business: "Repair service",
  bottleneck: "Manual dispatch",
  currentProcess: "Spreadsheet and calls",
  idealSystem: "Assigned requests",
};
test("accepts an enquiry and normalizes whitespace", () => {
  const result = validateEnquiry({ ...valid, name: " Sam " });
  assert.deepEqual(result.errors, {});
  assert.equal(result.data.name, "Sam");
});
test("requires operational context and identity", () => {
  assert.equal(Object.keys(validateEnquiry({}).errors).length, 7);
});
test("rejects invalid email, unsafe website, and oversized input", () => {
  const { errors } = validateEnquiry({
    ...valid,
    email: "invalid",
    website: "javascript:alert(1)",
    bottleneck: "a".repeat(3001),
  });
  assert.ok(errors.email);
  assert.ok(errors.website);
  assert.ok(errors.bottleneck);
});
test("rejects unexpected values and non-text payloads", () => {
  const { errors } = validateEnquiry({
    ...valid,
    company: { name: "x" },
    budget: "free",
    timeline: "now",
  });
  assert.ok(errors.company);
  assert.ok(errors.budget);
  assert.ok(errors.timeline);
});
test("rejects control characters and malformed input", () => {
  assert.ok(validateEnquiry({ ...valid, name: "Sam" + String.fromCharCode(0) }).errors.name);
  assert.ok(validateEnquiry(null).errors.form);
  assert.ok(validateEnquiry([]).errors.form);
});
test("accepts a complete HTTPS website and optional blank values", () => {
  assert.deepEqual(
    validateEnquiry({ ...valid, website: "https://example.com", context: "" }).errors,
    {},
  );
});
