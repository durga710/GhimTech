/**
 * Development seed — SAFE SYNTHETIC DATA ONLY. Never seed real taxpayer data.
 *
 * Creates the GhimTech organization, one user per role (password:
 * "GhimTechDev2026!" — development only, MFA enrollment forced on first
 * login), and one synthetic client with a draft 2025 return.
 */
import { PrismaClient } from "../src/generated/client/index.js";
import { blindIndex, encryptField, hashPassword, parseMasterKey } from "@ghimtech/security";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed a production environment");
  }
  const masterKey = parseMasterKey(process.env.GHIMTECH_MASTER_KEY);
  const indexKey = Buffer.from(process.env.GHIMTECH_INDEX_KEY ?? "", "hex");
  if (indexKey.length !== 32) throw new Error("GHIMTECH_INDEX_KEY must be 32 bytes hex");

  const org = await prisma.organization.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    create: { id: "00000000-0000-0000-0000-000000000001", name: "GhimTech" },
    update: {},
  });

  const password = await hashPassword("GhimTechDev2026!");
  const mk = (
    email: string,
    name: string,
    role: "ADMIN" | "PREPARER" | "REVIEWER" | "CLIENT" | "AUDITOR",
  ) =>
    prisma.user.upsert({
      where: { email },
      create: {
        organizationId: org.id,
        email,
        name,
        role,
        passwordHash: password,
        passwordResetForced: true,
      },
      update: {},
    });

  const admin = await mk("admin@dev.ghimtech.test", "Dev Admin", "ADMIN");
  const preparer = await mk("preparer@dev.ghimtech.test", "Dev Preparer", "PREPARER");
  await mk("reviewer@dev.ghimtech.test", "Dev Reviewer", "REVIEWER");
  await mk("auditor@dev.ghimtech.test", "Dev Auditor", "AUDITOR");
  const clientUser = await mk("client@dev.ghimtech.test", "Avery Testcase", "CLIENT");

  const syntheticTin = "123456789"; // structurally valid, synthetic
  const client = await prisma.client.upsert({
    where: { userId: clientUser.id },
    create: {
      organizationId: org.id,
      userId: clientUser.id,
      assignedPreparerId: preparer.id,
      firstName: "Avery",
      lastName: "Testcase",
      email: "client@dev.ghimtech.test",
      tags: ["family"],
      identity: {
        create: {
          tinEncrypted: encryptField(syntheticTin, masterKey),
          tinLast4: syntheticTin.slice(-4),
          tinIndex: blindIndex(syntheticTin, indexKey),
          dateOfBirth: new Date("1985-06-15"),
        },
      },
      addresses: {
        create: {
          line1: "100 Synthetic St",
          city: "Harrisburg",
          state: "PA",
          zip: "17101",
        },
      },
    },
    update: {},
  });

  await prisma.taxYearConfigRecord.upsert({
    where: { taxYear_jurisdiction: { taxYear: 2025, jurisdiction: "FEDERAL" } },
    create: { taxYear: 2025, jurisdiction: "FEDERAL", ruleVersion: "2025.1" },
    update: {},
  });
  await prisma.taxYearConfigRecord.upsert({
    where: { taxYear_jurisdiction: { taxYear: 2025, jurisdiction: "PENNSYLVANIA" } },
    create: { taxYear: 2025, jurisdiction: "PENNSYLVANIA", ruleVersion: "2025.1" },
    update: {},
  });

  await prisma.providerConfiguration.upsert({
    where: { name: "mock" },
    create: { name: "mock", active: true, settings: {} },
    update: {},
  });

  console.log(`Seeded org=${org.name} admin=${admin.email} client=${client.email}`);
  console.log("Dev password for all users: GhimTechDev2026! (password reset forced on login)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
