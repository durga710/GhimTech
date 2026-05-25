/**
 * Database seed script.
 *
 * Populates the DB with Durga's real project structure so the dashboard
 * isn't empty on first login. Run via:
 *
 *   npm run db:seed
 *
 * Behavior:
 *   - Idempotent: re-running won't duplicate. We delete-then-recreate for
 *     simplicity (acceptable for a single-operator dev tool).
 *   - Requires a real Clerk user to exist first. The script looks for an
 *     env var SEED_CLERK_ID; if not set, it bails with a helpful error.
 *     This is intentional — we never want to seed against a fake clerkId.
 *
 * Order of operations:
 *   1. Verify Clerk ID provided
 *   2. Upsert the User row
 *   3. Wipe + re-create projects, tasks, notifications, summaries, analytics
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const clerkId = process.env.SEED_CLERK_ID;
  const seedEmail = process.env.SEED_EMAIL ?? "durga@rayhealthevv.com";
  const seedFirstName = process.env.SEED_FIRST_NAME ?? "Durga";
  const seedLastName = process.env.SEED_LAST_NAME ?? "Ghimeray";

  if (!clerkId) {
    console.error(
      "\n[seed] ERROR: SEED_CLERK_ID environment variable is required.\n" +
        "Sign up via /sign-up first, then copy your Clerk user_id (visible\n" +
        "in the Clerk dashboard under Users) and re-run with:\n\n" +
        "  SEED_CLERK_ID=user_xxx npm run db:seed\n"
    );
    process.exit(1);
  }

  console.log(`[seed] Seeding data for clerkId=${clerkId}…`);

  // ============ User ============
  const user = await prisma.user.upsert({
    where: { clerkId },
    update: { email: seedEmail, firstName: seedFirstName, lastName: seedLastName },
    create: {
      clerkId,
      email: seedEmail,
      firstName: seedFirstName,
      lastName: seedLastName,
      preferences: { create: {} },
    },
  });
  console.log(`[seed] User ${user.email} ready (${user.id})`);

  // Wipe owned data so seed is idempotent
  await prisma.$transaction([
    prisma.analyticsEvent.deleteMany({ where: { userId: user.id } }),
    prisma.notification.deleteMany({ where: { userId: user.id } }),
    prisma.aiSummary.deleteMany({ where: { userId: user.id } }),
    prisma.task.deleteMany({ where: { userId: user.id } }),
    prisma.note.deleteMany({ where: { userId: user.id } }),
    prisma.goal.deleteMany({ where: { userId: user.id } }),
    // Projects last — cascades wipe milestones/deploys/roadmap
    prisma.project.deleteMany({ where: { userId: user.id } }),
  ]);
  console.log("[seed] Wiped owned data");

  // ============ Projects ============
  const rayhealth = await prisma.project.create({
    data: {
      userId: user.id,
      slug: "rayhealth-evv",
      name: "RayHealthEVV™",
      tagline: "Care. Verified. Delivered.",
      description:
        "A unified operating system for home-care agencies — caregiver, coordinator, billing, payroll, scheduling, training, and compliance in one calm surface.",
      status: "SHIPPING",
      progress: 78,
      pinned: true,
      color: "#1fe294",
      startedAt: new Date("2025-08-01"),
    },
  });

  const ghimtech = await prisma.project.create({
    data: {
      userId: user.id,
      slug: "ghimtech-site",
      name: "Ghimtech founder site",
      tagline: "Personal operating system + public face",
      description:
        "The site you're looking at right now. ghimtech.org — public marketing pages + private Command Center dashboard.",
      status: "SHIPPING",
      progress: 88,
      pinned: true,
      color: "#3aa4ff",
      startedAt: new Date("2026-05-01"),
    },
  });

  const brand = await prisma.project.create({
    data: {
      userId: user.id,
      slug: "brand-governance",
      name: "Brand & legal governance",
      tagline: "Owned positioning, compliant claims",
      description:
        "Brand voice, visual system, and legal claim governance for RayHealth and the founder profile.",
      status: "ACTIVE",
      progress: 64,
      color: "#7ec4ff",
      startedAt: new Date("2025-11-01"),
    },
  });

  const mobile = await prisma.project.create({
    data: {
      userId: user.id,
      slug: "mobile-apps",
      name: "iOS + Android caregiver apps",
      tagline: "Native mobile for RayHealth caregivers",
      description:
        "Native iOS and Android apps for caregivers, built in partnership with Google AI. Shared system prompts with the web platform.",
      status: "ACTIVE",
      progress: 42,
      color: "#66f5b8",
      startedAt: new Date("2026-02-15"),
    },
  });

  const copilot = await prisma.project.create({
    data: {
      userId: user.id,
      slug: "ai-copilot",
      name: "AI workflow copilot",
      tagline: "Gemini-powered per-role copilots",
      description:
        "Paid agency-level add-on. Per-role copilots for caregiver, coordinator, and owner. Confirm-every-action policy.",
      status: "ACTIVE",
      progress: 51,
      color: "#ffa726",
      startedAt: new Date("2026-01-10"),
    },
  });

  const partner = await prisma.project.create({
    data: {
      userId: user.id,
      slug: "partnerships",
      name: "Strategic partnerships",
      tagline: "Distribution + state Medicaid relationships",
      description:
        "Building relationships with state Medicaid programs, agency networks, and adjacent platforms.",
      status: "EXPLORING",
      progress: 18,
      color: "#a1a1aa",
      startedAt: new Date("2026-04-01"),
    },
  });

  console.log("[seed] Created 6 projects");

  // ============ Roadmap items (for RayHealth) ============
  await prisma.roadmapItem.createMany({
    data: [
      { projectId: rayhealth.id, quarter: "Q2 2026", title: "Command Glass platform-wide", status: "in_progress", order: 1 },
      { projectId: rayhealth.id, quarter: "Q2 2026", title: "AI copilot Fast / Deep modes", status: "in_progress", order: 2 },
      { projectId: rayhealth.id, quarter: "Q2 2026", title: "Mobile invite + access code activation", status: "in_progress", order: 3 },
      { projectId: rayhealth.id, quarter: "Q3 2026", title: "Per-agency analytics dashboards", status: "planned", order: 4 },
      { projectId: rayhealth.id, quarter: "Q3 2026", title: "Deployment audit log for owners", status: "planned", order: 5 },
      { projectId: rayhealth.id, quarter: "Q4 2026", title: "Public API for partner integrations", status: "planned", order: 6 },
      { projectId: rayhealth.id, quarter: "Q1 2027", title: "Healthcare OS positioning", status: "exploring", order: 7 },
    ],
  });

  // ============ Tasks ============
  const now = Date.now();
  const dayMs = 86_400_000;

  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        projectId: rayhealth.id,
        title: "Review pen-test report — auth surfaces",
        priority: "CRITICAL",
        status: "IN_PROGRESS",
        dueAt: new Date(now + 1 * dayMs),
      },
      {
        userId: user.id,
        projectId: brand.id,
        title: "Sign per-agency legal template addendum",
        priority: "HIGH",
        status: "TODO",
        dueAt: new Date(now + 2 * dayMs),
      },
      {
        userId: user.id,
        projectId: copilot.id,
        title: "Approve AI copilot confirm-action microcopy",
        priority: "HIGH",
        status: "REVIEW",
        dueAt: new Date(now + 3 * dayMs),
      },
      {
        userId: user.id,
        projectId: rayhealth.id,
        title: "Coordinator queue UX final review",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        dueAt: new Date(now + 5 * dayMs),
      },
      {
        userId: user.id,
        projectId: ghimtech.id,
        title: "Ship landing → production",
        priority: "HIGH",
        status: "REVIEW",
        dueAt: new Date(now + 1 * dayMs),
      },
      {
        userId: user.id,
        projectId: mobile.id,
        title: "Mobile: invite + access code activation handoff",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        dueAt: new Date(now + 4 * dayMs),
      },
      {
        userId: user.id,
        projectId: partner.id,
        title: "Partner intro: state Medicaid liaison",
        priority: "LOW",
        status: "TODO",
        dueAt: null,
      },
    ],
  });
  console.log("[seed] Created 7 active tasks");

  // ============ Deployments ============
  await prisma.deploymentLog.createMany({
    data: [
      { projectId: ghimtech.id, status: "SUCCESS", commitSha: "9f3e2c1", commitMsg: "Command Glass: refine owner dashboard density", deployedAt: new Date(now - 12 * 60_000), durationMs: 134_000 },
      { projectId: copilot.id, status: "SUCCESS", commitSha: "4a8c901", commitMsg: "AI copilot: confirm-every-action for coordinator role", deployedAt: new Date(now - 1 * 60 * 60_000), durationMs: 118_000 },
      { projectId: rayhealth.id, status: "SUCCESS", commitSha: "c2f4810", commitMsg: "Missed-punch: incomplete signature submit path", deployedAt: new Date(now - 4 * 60 * 60_000), durationMs: 182_000 },
      { projectId: brand.id, status: "SUCCESS", commitSha: "7b1a4d3", commitMsg: "Legal templates: per-agency override schema", deployedAt: new Date(now - 1 * dayMs), durationMs: 161_000 },
      { projectId: mobile.id, status: "SUCCESS", environment: "staging", commitSha: "e9c4287", commitMsg: "Mobile: access-code activation handoff", deployedAt: new Date(now - 1 * dayMs - 4 * 60 * 60_000), durationMs: 107_000 },
      { projectId: rayhealth.id, status: "SUCCESS", commitSha: "1d8b3a5", commitMsg: "Invite flow: admin revoke + resend controls", deployedAt: new Date(now - 2 * dayMs), durationMs: 143_000 },
    ],
  });
  console.log("[seed] Created 6 deployment logs");

  // ============ Analytics events — 30 days of activity ============
  // Generates realistic-looking ship/open activity. Deterministic-ish.
  const events: Array<{ userId: string; projectId: string; event: string; occurredAt: Date }> = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const projectIds = [rayhealth.id, ghimtech.id, brand.id, mobile.id, copilot.id];
  for (let day = 29; day >= 0; day--) {
    const d = new Date(now - day * dayMs);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const shipped = isWeekend ? Math.floor(rand() * 2) : 1 + Math.floor(rand() * 4);
    const opened = isWeekend ? Math.floor(rand() * 2) : Math.floor(rand() * 3);
    for (let i = 0; i < shipped; i++) {
      events.push({
        userId: user.id,
        projectId: projectIds[Math.floor(rand() * projectIds.length)],
        event: "task.shipped",
        occurredAt: new Date(d.getTime() + Math.floor(rand() * dayMs)),
      });
    }
    for (let i = 0; i < opened; i++) {
      events.push({
        userId: user.id,
        projectId: projectIds[Math.floor(rand() * projectIds.length)],
        event: "task.opened",
        occurredAt: new Date(d.getTime() + Math.floor(rand() * dayMs)),
      });
    }
  }
  await prisma.analyticsEvent.createMany({ data: events });
  console.log(`[seed] Created ${events.length} analytics events`);

  // ============ Notifications ============
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        kind: "DEPLOY",
        title: "Production deploy succeeded",
        body: "ghimtech.org · phase-5 build · 2m 14s",
        createdAt: new Date(now - 8 * 60_000),
      },
      {
        userId: user.id,
        kind: "AGENT",
        title: "Daily summary ready",
        body: "Your morning brief is queued at the top.",
        createdAt: new Date(now - 60 * 60_000),
      },
      {
        userId: user.id,
        kind: "ALERT",
        title: "1 missed punch awaiting review",
        body: "Visit · A.M. · scheduled 07:30",
        createdAt: new Date(now - 2 * 60 * 60_000),
      },
      {
        userId: user.id,
        kind: "INFO",
        title: "RayHealth weekly metrics updated",
        body: "Ship velocity ↑ 24% vs prior week.",
        readAt: new Date(now - 23 * 60 * 60_000),
        createdAt: new Date(now - 1 * dayMs),
      },
      {
        userId: user.id,
        kind: "DEPLOY",
        title: "Staging deploy: AI copilot v0.4.2",
        body: "Behind-the-flag · Owner role only",
        readAt: new Date(now - 22 * 60 * 60_000),
        createdAt: new Date(now - 1 * dayMs - 2 * 60 * 60_000),
      },
    ],
  });
  console.log("[seed] Created 5 notifications");

  // ============ Daily brief ============
  await prisma.aiSummary.create({
    data: {
      userId: user.id,
      scope: "daily-brief",
      headline: "Steady week. Two items want your judgment.",
      body:
        "RayHealth shipped 4 items into production overnight, all green. The Command Glass owner dashboard density refinement landed cleanly. Two items need your call this morning: the pen-test report on auth surfaces (critical, due tomorrow) and the per-agency legal template addendum (high, due in two days). No active incidents. AI copilot's confirm-action microcopy is queued for your review — recommend approving and shipping behind the existing flag.",
      highlights: [
        "4 deploys overnight · 0 incidents",
        "Pen-test review — critical, due tomorrow",
        "Legal template addendum — needs signature",
        "AI copilot microcopy ready to ship",
      ],
      model: "seed-data",
    },
  });
  console.log("[seed] Created daily brief");

  // ============ Goals ============
  await prisma.goal.createMany({
    data: [
      { userId: user.id, title: "RayHealth ship velocity", target: 40, current: 33, unit: "tasks", period: "monthly" },
      { userId: user.id, title: "Partner conversations", target: 10, current: 4, unit: "meetings", period: "monthly" },
      { userId: user.id, title: "Deploy cadence", target: 20, current: 17, unit: "deploys", period: "monthly" },
    ],
  });
  console.log("[seed] Created 3 goals");

  console.log("\n[seed] ✓ Done. Sign in at /dashboard to see your data.");
}

main()
  .catch((e) => {
    console.error("[seed] FAILED", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
