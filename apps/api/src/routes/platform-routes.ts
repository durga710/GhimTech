/**
 * Platform routes: health, dashboard aggregates, audit access, and reporting.
 */
import type { FastifyInstance } from "fastify";
import { RETURN_STATUSES } from "@ghimtech/tax-domain";
import { supportedTaxYears } from "@ghimtech/tax-year-config";
import type { AuthenticatedApp } from "../plugins/auth.js";
import type { RouteContext } from "./auth-routes.js";

export function registerPlatformRoutes(app: FastifyInstance, ctx: RouteContext): void {
  const typedApp = app as AuthenticatedApp;
  const { store, audit } = ctx;

  app.get("/health", async () => ({
    ok: true,
    service: "ghimtech-tax-api",
    supportedTaxYears: supportedTaxYears(),
  }));

  app.get("/dashboard", { preHandler: [typedApp.requirePermission("reports:read")] }, async () => {
    const returns = await store.listReturns();
    const byStatus: Record<string, number> = {};
    for (const status of RETURN_STATUSES) byStatus[status] = 0;
    for (const ret of returns) byStatus[ret.status] = (byStatus[ret.status] ?? 0) + 1;

    const clients = await store.listClients();
    const accepted = byStatus["ACCEPTED"]! + byStatus["ARCHIVED"]!;
    const rejected = byStatus["REJECTED"]! + byStatus["CORRECTION_REQUIRED"]!;
    const resolved = accepted + rejected;
    return {
      returnsByStatus: byStatus,
      totals: {
        clients: clients.length,
        returns: returns.length,
        awaitingReview: byStatus["READY_FOR_REVIEWER"],
        awaitingSignature: byStatus["AWAITING_SIGNATURE"],
        readyToFile: byStatus["READY_TO_EFILE"],
        transmitted: byStatus["TRANSMITTED"]! + byStatus["ACKNOWLEDGMENT_PENDING"]!,
        accepted,
        rejected,
        acceptanceRate: resolved === 0 ? null : Math.round((accepted / resolved) * 100) / 100,
      },
    };
  });

  app.get("/audit", { preHandler: [typedApp.requirePermission("audit:read")] }, async (request) => {
    const query = request.query as { entityId?: string; limit?: string };
    const events = await store.listAuditEvents({
      entityId: query.entityId,
      limit: query.limit ? Number(query.limit) : 200,
    });
    return events;
  });

  app.get("/audit/verify", { preHandler: [typedApp.requirePermission("audit:read")] }, async () =>
    audit.verify(),
  );
}
