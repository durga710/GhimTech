# ADR 0005 — Structured form documents + print rendering (no PDF facsimiles yet)

**Status**: accepted · **Date**: 2026-08-02

## Decision

The forms engine produces structured `FormDocument`s (sections → numbered lines with values, trace links, masked identity) rendered to print-optimized HTML with watermarks (DRAFT / REVIEW / CLIENT COPY). Browser print produces PDFs. IRS-facsimile rendering onto official form PDFs is deferred.

## Rationale

Filing copies travel to agencies through the e-file provider as data, not as PDFs — facsimile rendering is a review/records concern, not a filing correctness concern. Hand-building pixel-accurate 1040 layouts (or embedding official PDF templates) is substantial work with real maintenance cost per year; the structured representation captures every line with its trace link today and is exactly the input a facsimile renderer needs later.

## Consequences

Client and review copies are clean line-item documents, not replicas of the government form. When facsimile output is required (e.g., paper-filing support), add a renderer that fills official PDF templates from the existing form-to-field mapping — no mapper changes needed.
