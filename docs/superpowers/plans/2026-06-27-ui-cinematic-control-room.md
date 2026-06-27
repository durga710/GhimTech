# Cinematic Control Room UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the public site and dashboard feel dramatically more premium, cinematic, and intentional while preserving clarity, accessibility, and the existing brand.

**Architecture:** We will push the new visual language through shared global tokens first, then apply it consistently across the landing page and dashboard shell. The work is split so the foundational atmosphere, motion, and reusable surface styles land before page-specific composition, which keeps the result coherent and limits churn in component boundaries.

**Tech Stack:** Next.js App Router, React, Framer Motion, Tailwind CSS, TypeScript.

---

### Task 1: Rebuild the global visual language

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Test: visual browser check on the landing page and dashboard

- [ ] **Step 1: Add stronger background atmosphere, grid overlays, scanline texture, and premium surface tokens**

```css
@layer base {
  :root {
    --background: 4 5 8;
    --foreground: 244 246 250;
    --muted: 26 31 43;
    --muted-foreground: 138 146 161;
    --border: 255 255 255;
    --ring: 86 168 255;
    --radius: 0.875rem;
  }

  html {
    @apply bg-ink-950 text-foreground antialiased;
    color-scheme: dark;
    font-feature-settings: "ss01", "cv11", "calt";
  }

  body {
    @apply bg-ink-950 text-zinc-100 selection:bg-signal-400/30 selection:text-white;
    background-image:
      radial-gradient(ellipse 80% 60% at 50% -10%, rgba(86, 168, 255, 0.14), transparent 60%),
      radial-gradient(ellipse 60% 50% at 100% 100%, rgba(49, 227, 154, 0.08), transparent 60%),
      radial-gradient(ellipse 50% 40% at 0% 100%, rgba(255, 111, 135, 0.05), transparent 60%);
    background-attachment: fixed;
  }

  h1, h2, h3 {
    @apply font-display;
  }
}
```

- [ ] **Step 2: Add the shared utility classes used by the new layout**

```css
@layer components {
  .glass-panel {
    @apply relative rounded-2xl bg-ink-800/40 backdrop-blur-xl;
    background-image:
      linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 40%),
      linear-gradient(180deg, transparent 70%, rgba(255, 255, 255, 0.015));
    box-shadow:
      0 1px 0 0 rgba(255, 255, 255, 0.06) inset,
      0 0 0 1px rgba(255, 255, 255, 0.06),
      0 30px 60px -30px rgba(0, 0, 0, 0.8);
  }

  .glass-panel-strong {
    @apply relative rounded-2xl bg-ink-800/60 backdrop-blur-2xl;
    background-image:
      linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 50%);
    box-shadow:
      0 1px 0 0 rgba(255, 255, 255, 0.08) inset,
      0 0 0 1px rgba(255, 255, 255, 0.08),
      0 40px 80px -40px rgba(0, 0, 0, 0.9);
  }

  .label-tactical {
    @apply font-mono text-[10px] uppercase tracking-tactical text-zinc-400;
  }

  .text-gradient-signal {
    background: linear-gradient(180deg, #ffffff 0%, #b7d8ff 40%, #56a8ff 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .text-gradient-vital {
    background: linear-gradient(180deg, #ffffff 0%, #7df4c0 40%, #31e39a 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .btn-signal {
    @apply relative inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5
           text-sm font-medium text-white transition-all duration-300
           bg-gradient-to-b from-signal-400 to-signal-500
           shadow-glow-signal
           hover:shadow-[0_0_60px_-10px_rgba(58,164,255,0.7)] hover:-translate-y-px
           active:translate-y-0;
  }
}
```

- [ ] **Step 3: Add motion helpers for the new cinematic feel**

```ts
export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(20px)", y: 12 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 1.2, ease: easeOut },
  },
};

export const floatY = {
  animate: {
    y: [0, -6, 0],
    transition: { duration: 6, repeat: Infinity, ease: easeInOut },
  },
};
```

- [ ] **Step 4: Verify the global atmosphere on the landing page and dashboard shell**

Run: `npm run lint && npm run type-check`
Expected: both commands pass after the style tokens are in place.

### Task 2: Turn the landing page into a flagship cinematic hero

**Files:**
- Modify: `src/components/landing/hero.tsx`
- Modify: `src/components/landing/values-section.tsx`
- Modify: `src/components/landing/featured-project.tsx`
- Modify: `src/components/landing/closing-cta.tsx`
- Modify: `src/components/landing/ambient-backdrop.tsx`
- Modify: `src/components/shared/top-nav.tsx`
- Modify: `src/app/page.tsx`
- Test: browser screenshot on the landing page

- [ ] **Step 1: Replace the current hero composition with a more dramatic split-layout**

```tsx
<section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32">
  <div className="container relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="lg:col-span-7 relative">
      <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
        <span className="status-dot status-dot-live" />
        <span className="label-tactical">
          {HERO.status.label} · <span className="text-vital-300">{HERO.status.value}</span>
        </span>
      </motion.div>

      <motion.h1 variants={blurIn} className="font-display text-hero text-white">
        <span className="block">{line1}</span>
        <span className="block text-gradient-signal">{line2}</span>
      </motion.h1>

      <motion.p variants={fadeUp} className="mt-8 max-w-xl text-lg text-zinc-400 leading-relaxed">
        {HERO.sub}
      </motion.p>
    </motion.div>
  </div>
</section>
```

- [ ] **Step 2: Make the founder card and ticker feel like premium control-room hardware**

```tsx
<div className="glass-panel-strong relative p-6 hud-corners">
  <div className="absolute -inset-8 bg-signal-400/10 blur-3xl rounded-full" />
  <div className="flex items-center justify-between">
    <span className="label-tactical">Operator profile</span>
    <span className="flex items-center gap-1.5 label-tactical text-vital-300">
      <span className="status-dot status-dot-live" /> Online
    </span>
  </div>
</div>
```

- [ ] **Step 3: Increase section contrast and card depth in values, featured project, and CTA**

```tsx
className="group relative glass-panel p-7 overflow-hidden"
```

```tsx
className="glass-panel-strong p-8 lg:p-10 relative overflow-hidden hud-corners"
```

```tsx
<section className="relative py-32">
  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(86,168,255,0.18),transparent_60%)] blur-3xl" />
</section>
```

- [ ] **Step 4: Tighten the top navigation so it feels like part of the system**

```tsx
<motion.header
  initial={{ y: -20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1100px,calc(100vw-2rem))]"
>
  <nav className="glass-panel-strong flex items-center justify-between px-2 py-2">
```

- [ ] **Step 5: Run a browser pass and tune spacing, glow, and hierarchy from screenshots**

Run: `npm run dev`
Expected: landing page still loads and the visual hierarchy is stronger than the baseline.

### Task 3: Make the dashboard shell feel like the same universe

**Files:**
- Modify: `src/components/dashboard/dashboard-sidebar.tsx`
- Modify: `src/components/dashboard/dashboard-topbar.tsx`
- Modify: `src/app/dashboard/layout.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/dashboard/analytics/page.tsx`
- Modify: `src/app/dashboard/notifications/page.tsx`
- Modify: `src/app/dashboard/projects/page.tsx`
- Modify: `src/app/dashboard/tasks/page.tsx`
- Modify: `src/app/dashboard/inbox/page.tsx`
- Modify: `src/app/dashboard/settings/page.tsx`
- Test: browser screenshot on the dashboard

- [ ] **Step 1: Give the sidebar stronger presence and more intentional active states**

```tsx
<aside
  className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 z-40
             glass-panel-strong rounded-none border-r border-white/[0.06]
             flex-col"
>
```

- [ ] **Step 2: Upgrade the top bar to read like a control strip**

```tsx
<motion.header
  initial={{ y: -12, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  className="sticky top-0 z-30 backdrop-blur-xl bg-ink-950/60 border-b border-white/[0.06]"
>
```

- [ ] **Step 3: Rebalance dashboard page layouts so cards feel layered and premium rather than flat**

```tsx
<div className="glass-panel p-6">
  <div className="flex items-center justify-between">
    <span className="label-tactical">Deployment progress</span>
    <span className="font-mono text-2xl text-white tabular-nums">
      {project.progress}%
    </span>
  </div>
</div>
```

- [ ] **Step 4: Verify dashboard readability and polish in the browser**

Run: `npm run dev`
Expected: sidebar, top bar, and primary content all share the same dramatic control-room language.

### Task 4: Polish and harden the new visual system

**Files:**
- Modify: `src/components/shared/section-header.tsx`
- Modify: `src/components/shared/site-footer.tsx`
- Modify: `src/components/shared/logo.tsx`
- Modify: `src/components/shared/count-up.tsx`
- Test: `npm run lint`, `npm run type-check`, `npm run build`

- [ ] **Step 1: Sweep shared primitives for inconsistent text sizes, spacing, and border treatments**

```tsx
className={cn(
  "max-w-3xl",
  align === "center" && "mx-auto text-center",
  className
)}
```

- [ ] **Step 2: Make any lingering low-contrast or cramped surfaces match the new system**

```css
.hairline {
  @apply h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent;
}
```

- [ ] **Step 3: Run the full verification suite**

Run:

```bash
npm run lint
npm run type-check
npm run build
```

Expected: all three pass.

- [ ] **Step 4: Commit the UI redesign**

```bash
git add src/app/globals.css src/app/layout.tsx src/components src/app docs/superpowers/plans/2026-06-27-ui-cinematic-control-room.md
git commit -m "feat: cinematic ui overhaul"
```

## Coverage Check

- Landing hero: Task 2
- Supporting landing sections: Task 2
- Top nav: Task 2
- Dashboard sidebar/top bar: Task 3
- Shared surfaces: Task 1 and Task 4
- Motion and atmosphere: Task 1 and Task 2
- Accessibility and performance checks: Task 4

## Notes

- Keep the implementation incremental and visual-first.
- Prefer shared styling tokens over one-off utility spaghetti.
- Re-run screenshots after each major task so the final result lands with intent rather than accidental overreach.
