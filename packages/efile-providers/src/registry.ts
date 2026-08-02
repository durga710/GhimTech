/**
 * Provider registry: resolves the active provider from configuration.
 * Core business logic depends only on the EFileProvider interface; the
 * concrete choice is an environment/database configuration concern.
 */
import type { EFileProvider } from "@ghimtech/efile-core";
import { MockEFileProvider } from "./mock.js";
import { SandboxEFileProvider } from "./sandbox.js";
import {
  createAprilProvider,
  createColumnTaxProvider,
  createGenericAuthorizedTransmitterProvider,
} from "./placeholders.js";

export const PROVIDER_NAMES = ["mock", "sandbox", "column-tax", "april", "generic"] as const;
export type ProviderName = (typeof PROVIDER_NAMES)[number];

export function createProvider(name: string): EFileProvider {
  switch (name) {
    case "mock":
      return new MockEFileProvider();
    case "sandbox":
      return new SandboxEFileProvider();
    case "column-tax":
      return createColumnTaxProvider();
    case "april":
      return createAprilProvider();
    case "generic":
      return createGenericAuthorizedTransmitterProvider();
    default:
      throw new Error(
        `Unknown e-file provider "${name}". Valid providers: ${PROVIDER_NAMES.join(", ")}`,
      );
  }
}
