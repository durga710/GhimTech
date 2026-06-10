/**
 * Validation schemas — Zod.
 *
 * Every API route validates its input against one of these. The schemas
 * also serve as the TS types via z.infer<typeof Schema>, so we get one
 * source of truth for both validation and types.
 *
 * Naming convention:
 *   - *CreateSchema → for POST endpoints
 *   - *UpdateSchema → for PATCH endpoints (all fields optional)
 *   - *Schema      → for response shaping / shared types
 */

import { z } from "zod";

// ============ Enums (mirror Prisma enums) ============
export const ProjectStatusEnum = z.enum([
  "EXPLORING",
  "ACTIVE",
  "SHIPPING",
  "MAINTAINING",
  "PAUSED",
  "ARCHIVED",
]);

export const TaskStatusEnum = z.enum([
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "BLOCKED",
  "DONE",
]);

export const PriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const NotificationKindEnum = z.enum([
  "INFO",
  "ALERT",
  "DEPLOY",
  "AGENT",
  "SUCCESS",
]);

// ============ Project ============
export const ProjectCreateSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9][a-z0-9-]*$/i, "Slug must be lowercase letters, numbers, and hyphens only"),
  name: z.string().min(1).max(120),
  tagline: z.string().max(200).optional(),
  description: z.string().max(8000).optional(),
  status: ProjectStatusEnum.default("ACTIVE"),
  progress: z.number().int().min(0).max(100).default(0),
  pinned: z.boolean().default(false),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a 6-digit hex code")
    .optional(),
  sourceRepo: z
    .string()
    .max(140)
    .regex(/^[\w.-]+\/[\w.-]+$/, 'Repo must be in "owner/name" form, e.g. durga710/rayhealth-evv-platform')
    .nullable()
    .optional(),
});

export const ProjectUpdateSchema = ProjectCreateSchema.partial().omit({ slug: true });

export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;

// ============ Task ============
export const TaskCreateSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(8000).optional(),
  status: TaskStatusEnum.default("TODO"),
  priority: PriorityEnum.default("MEDIUM"),
  dueAt: z.string().datetime().optional().nullable(),
  projectId: z.string().cuid().optional().nullable(),
  tags: z.array(z.string().max(40)).max(20).default([]),
});

export const TaskUpdateSchema = TaskCreateSchema.partial();

export type TaskCreate = z.infer<typeof TaskCreateSchema>;
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;

// ============ Note ============
export const NoteCreateSchema = z.object({
  title: z.string().min(1).max(300),
  body: z.string().min(1).max(50_000),
  tags: z.array(z.string().max(40)).max(20).default([]),
  pinned: z.boolean().default(false),
});

export const NoteUpdateSchema = NoteCreateSchema.partial();

export type NoteCreate = z.infer<typeof NoteCreateSchema>;
export type NoteUpdate = z.infer<typeof NoteUpdateSchema>;

// ============ Contact (public, unauthenticated) ============
export const ContactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  purpose: z.enum(["agency", "partner", "press", "hello", "other"]),
  message: z.string().min(10).max(2000),
});

export type ContactInput = z.infer<typeof ContactSchema>;

// ============ Contact message admin (dashboard inbox) ============
export const ContactMessageUpdateSchema = z.object({
  read: z.boolean().optional(),
  archived: z.boolean().optional(),
});
export type ContactMessageUpdate = z.infer<typeof ContactMessageUpdateSchema>;

// ============ Copilot project-update proposal (GitHub-informed) ============
export const CopilotProposalSchema = z.object({
  suggestedProgress: z.number().int().min(0).max(100).optional(),
  milestones: z
    .array(z.object({ title: z.string().min(1).max(300), description: z.string().max(2000).optional() }))
    .max(20)
    .optional()
    .default([]),
  roadmap: z
    .array(
      z.object({
        title: z.string().min(1).max(300),
        quarter: z.string().max(20).optional(),
        status: z.string().max(40).optional(),
      }),
    )
    .max(20)
    .optional()
    .default([]),
  tasks: z
    .array(z.object({ title: z.string().min(1).max(300), priority: PriorityEnum.optional() }))
    .max(30)
    .optional()
    .default([]),
});
export type CopilotProposal = z.infer<typeof CopilotProposalSchema>;

// ============ User preferences ============
export const UserPreferencesUpdateSchema = z.object({
  peaceOfMindMode: z.boolean().optional(),
  dashboardDensity: z.enum(["compact", "comfortable", "spacious"]).optional(),
  notificationEmail: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  aiBriefEnabled: z.boolean().optional(),
});

export type UserPreferencesUpdate = z.infer<typeof UserPreferencesUpdateSchema>;
