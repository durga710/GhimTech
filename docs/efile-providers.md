# E-file provider architecture

GhimTech Tax never connects to the IRS or the Pennsylvania Department of Revenue directly. Filing goes through an **authorized e-file provider** behind the `EFileProvider` interface in `@ghimtech/efile-core`. The final provider has not been selected; candidates include Column Tax, april, and other authorized transmitters that approve GhimTech's use case.

## The contract

`EFileProvider` covers the full lifecycle: `createTaxpayer`, `createReturn`, `updateReturn`, `validateReturn`, `generateAuthorization`, `submitReturn`, `getSubmissionStatus`, `getAcknowledgment`, `resubmitReturn`. Adapters translate the normalized `TaxReturnModel` to the provider's shape at the boundary; nothing provider-specific exists outside `@ghimtech/efile-providers`.

The `EFileOrchestrator` sits in front of every adapter and enforces the platform's non-negotiables regardless of provider behavior: no submission with blocking diagnostics, signature hash must match the current snapshot, and duplicate-submission protection (only a REJECTED submission may be corrected and resubmitted).

## Available adapters

| Adapter      | Status      | Behavior                                                                                                                                                                                                                             |
| ------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mock`       | Working     | Deterministic in-memory simulation. Scripted outcomes: taxpayer SSN last-4 `9999` → `R0000-500-01`; `9998` → `IND-031-04`; dependent `9997` → `SEIC-F1040-501-02`; otherwise accepted. Acknowledgment resolves after N status polls. |
| `sandbox`    | Working     | Mock behind simulated latency and longer ack delay — exercises the queue/polling machinery like a real integration.                                                                                                                  |
| `column-tax` | Placeholder | Throws `ProviderNotConfiguredError`. No endpoints invented.                                                                                                                                                                          |
| `april`      | Placeholder | Throws `ProviderNotConfiguredError`.                                                                                                                                                                                                 |
| `generic`    | Placeholder | For any other authorized transmitter.                                                                                                                                                                                                |

Selection is configuration (`GHIMTECH_EFILE_PROVIDER` / the `ProviderConfiguration` table) — never code in the domain.

## Implementing a real adapter (checklist)

1. Signed agreement authorizing GhimTech's use case; obtain official API documentation and sandbox credentials.
2. Implement the adapter inside `packages/efile-providers/src/<provider>.ts` strictly against the documented contract — do not guess endpoints or fields.
3. Map `TaxReturnModel` → provider payloads in the adapter; raise `EFileValidationIssue`s for anything the provider cannot represent.
4. Add the adapter to the **contract-test matrix** in `contract.test.ts` (run against the provider's sandbox in a dedicated CI job with secrets).
5. Record rejection codes the provider surfaces in `rejection-codes.ts` with plain-language explanations and corrective actions.
6. Verify the swap changes nothing outside the adapter package: intake, calculation, review, signatures, return models, filing UI, and audit logs must be untouched (this is the point of the architecture).
7. Update this document and the threat model (third-party boundary section).

## Acknowledgment handling

Polling is idempotent: acknowledgments upsert once per submission, repeat polls are safe, and REJECTED acknowledgments carry the code dictionary's explanation and corrective action into the UI and the audit log. Federal and Pennsylvania acknowledgments are recorded per submission jurisdiction.
