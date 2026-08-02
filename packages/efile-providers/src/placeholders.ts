/**
 * Placeholder adapters for authorized e-file transmitters under evaluation.
 *
 * These deliberately implement nothing. No provider endpoints are invented
 * here — each adapter throws ProviderNotConfiguredError until the provider's
 * official API contract is available and the adapter is implemented and
 * contract-tested against it. See docs/efile-providers.md for the
 * integration checklist.
 */
import { ProviderNotConfiguredError, type EFileProvider } from "@ghimtech/efile-core";

function unconfigured(name: string, detail: string): EFileProvider {
  const fail = async (): Promise<never> => {
    throw new ProviderNotConfiguredError(name, detail);
  };
  return {
    name,
    createTaxpayer: fail,
    createReturn: fail,
    updateReturn: fail,
    validateReturn: fail,
    generateAuthorization: fail,
    submitReturn: fail,
    getSubmissionStatus: fail,
    getAcknowledgment: fail,
    resubmitReturn: fail,
  };
}

/**
 * Column Tax adapter placeholder. Implementation requires Column Tax's
 * official API documentation and a signed agreement authorizing GhimTech's
 * use case.
 */
export function createColumnTaxProvider(): EFileProvider {
  return unconfigured(
    "column-tax",
    "awaiting official Column Tax API documentation and partner agreement",
  );
}

/**
 * april adapter placeholder. Implementation requires april's official API
 * documentation and a signed agreement authorizing GhimTech's use case.
 */
export function createAprilProvider(): EFileProvider {
  return unconfigured("april", "awaiting official april API documentation and partner agreement");
}

/**
 * Generic authorized-transmitter placeholder for any other IRS-authorized
 * e-file provider that approves GhimTech's use case.
 */
export function createGenericAuthorizedTransmitterProvider(
  displayName = "generic-transmitter",
): EFileProvider {
  return unconfigured(displayName, "no transmitter contract configured");
}
