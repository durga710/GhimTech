import { describe, expect, it } from "vitest";
import {
  IllegalTransitionError,
  TransitionPermissionError,
  RETURN_STATUSES,
  allowedTransitions,
  assertTransition,
  isLocked,
  isTransitionAllowed,
} from "./lifecycle.js";

describe("filing lifecycle state machine", () => {
  it("includes every required status", () => {
    expect(RETURN_STATUSES).toHaveLength(23);
    expect(RETURN_STATUSES).toContain("DRAFT");
    expect(RETURN_STATUSES).toContain("ARCHIVED");
  });

  it("allows the happy path from draft to archived", () => {
    assertTransition("DRAFT", "READY_FOR_PREPARER_REVIEW", "PREPARER");
    assertTransition("READY_FOR_PREPARER_REVIEW", "PREPARER_REVIEWED", "PREPARER");
    assertTransition("PREPARER_REVIEWED", "READY_FOR_REVIEWER", "PREPARER");
    assertTransition("READY_FOR_REVIEWER", "APPROVED", "REVIEWER");
    assertTransition("APPROVED", "AWAITING_CLIENT_REVIEW", "PREPARER");
    assertTransition("AWAITING_CLIENT_REVIEW", "AWAITING_SIGNATURE", "CLIENT");
    assertTransition("AWAITING_SIGNATURE", "SIGNED", "CLIENT");
    assertTransition("SIGNED", "READY_TO_EFILE", "PREPARER");
    assertTransition("READY_TO_EFILE", "VALIDATING", "SYSTEM");
    assertTransition("VALIDATING", "QUEUED_FOR_TRANSMISSION", "SYSTEM");
    assertTransition("QUEUED_FOR_TRANSMISSION", "TRANSMITTING", "SYSTEM");
    assertTransition("TRANSMITTING", "TRANSMITTED", "SYSTEM");
    assertTransition("TRANSMITTED", "ACKNOWLEDGMENT_PENDING", "SYSTEM");
    assertTransition("ACKNOWLEDGMENT_PENDING", "ACCEPTED", "SYSTEM");
    assertTransition("ACCEPTED", "ARCHIVED", "PREPARER");
  });

  it("supports the rejection and resubmission path", () => {
    assertTransition("ACKNOWLEDGMENT_PENDING", "REJECTED", "SYSTEM");
    assertTransition("REJECTED", "CORRECTION_REQUIRED", "SYSTEM");
    assertTransition("CORRECTION_REQUIRED", "READY_FOR_PREPARER_REVIEW", "PREPARER");
    assertTransition("CORRECTION_REQUIRED", "RESUBMISSION_READY", "PREPARER");
    assertTransition("RESUBMISSION_READY", "RESUBMITTED", "SYSTEM");
    assertTransition("RESUBMITTED", "ACKNOWLEDGMENT_PENDING", "SYSTEM");
  });

  it("rejects illegal transitions", () => {
    expect(() => assertTransition("DRAFT", "ACCEPTED", "ADMIN")).toThrow(IllegalTransitionError);
    expect(() => assertTransition("ACCEPTED", "DRAFT", "ADMIN")).toThrow(IllegalTransitionError);
    expect(() => assertTransition("ARCHIVED", "DRAFT", "ADMIN")).toThrow(IllegalTransitionError);
  });

  it("rejects transitions the role is not allowed to make", () => {
    // A client cannot approve their own return.
    expect(() => assertTransition("READY_FOR_REVIEWER", "APPROVED", "CLIENT")).toThrow(
      TransitionPermissionError,
    );
    // A preparer cannot approve — only a reviewer or admin can.
    expect(() => assertTransition("READY_FOR_REVIEWER", "APPROVED", "PREPARER")).toThrow(
      TransitionPermissionError,
    );
    // A human cannot force a transmit-side transition.
    expect(() => assertTransition("VALIDATING", "QUEUED_FOR_TRANSMISSION", "ADMIN")).toThrow(
      TransitionPermissionError,
    );
    // An auditor can never transition anything.
    for (const from of RETURN_STATUSES) {
      expect(
        allowedTransitions(from, "AUDITOR").filter((t) => isTransitionAllowed(from, t, "AUDITOR")),
      ).toEqual([]);
    }
  });

  it("locks returns from signature onward", () => {
    expect(isLocked("SIGNED")).toBe(true);
    expect(isLocked("TRANSMITTED")).toBe(true);
    expect(isLocked("ACCEPTED")).toBe(true);
    expect(isLocked("ARCHIVED")).toBe(true);
    expect(isLocked("DRAFT")).toBe(false);
    expect(isLocked("REVIEW_CHANGES_REQUESTED")).toBe(false);
    // Rejected/correction states are editable so corrections can be made.
    expect(isLocked("REJECTED")).toBe(false);
    expect(isLocked("CORRECTION_REQUIRED")).toBe(false);
  });

  it("exposes allowed transitions per role for the UI", () => {
    expect(allowedTransitions("READY_FOR_REVIEWER", "REVIEWER")).toEqual([
      "APPROVED",
      "REVIEW_CHANGES_REQUESTED",
    ]);
    expect(allowedTransitions("AWAITING_SIGNATURE", "CLIENT")).toContain("SIGNED");
  });
});
