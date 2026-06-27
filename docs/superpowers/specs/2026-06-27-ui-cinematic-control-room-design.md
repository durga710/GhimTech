# Cinematic Control Room UI Design

## Goal

Push the public site and dashboard into a more dramatic, premium, and highly intentional visual system without sacrificing clarity, speed, or the existing brand identity.

## Direction

Use the "Cinematic Control Room" lane from the visual exploration:

- Dark, atmospheric surfaces with stronger depth and lighting
- Larger, more expressive typography
- Clear hierarchy with fewer but stronger focal points
- Glass and telemetry-inspired panels that feel custom-built
- Motion that is deliberate and cinematic, not noisy

## Scope

This pass updates the visual treatment of the main public and authenticated surfaces:

- Landing page
- Top navigation
- Hero section
- Values / operating principles section
- Featured project section
- Closing CTA
- Dashboard shell
- Dashboard top bar
- Dashboard sidebar
- Shared panel, chip, and button styling where needed to keep the system consistent

No new product features are introduced in this pass.

## Design Principles

1. Make the first screen feel like a premium operator interface.
2. Increase contrast between background atmosphere and foreground content.
3. Use glow, blur, and borders sparingly but with purpose.
4. Keep the interface legible before it is decorative.
5. Make the dashboard feel as intentional as the marketing site.

## Landing Page Changes

### Hero

- Enlarge the headline and give it more visual weight.
- Increase the ambient lighting and layer the background more aggressively.
- Strengthen the founder card so it reads like a premium identity panel.
- Make the CTA row feel more substantial, with clearer primary/secondary emphasis.
- Expand telemetry-style support content so the hero feels like a real control surface, not just a marketing header.

### Supporting Sections

- Give the values cards more depth and more confident spacing.
- Make the featured project feel more like a flagship product showcase.
- Push the closing CTA into a more theatrical final beat with a stronger glow and clearer action split.
- Tighten spacing rhythms so every section feels intentional and paced.

### Navigation

- Increase the perceived polish of the top nav.
- Make the active state feel more like a control indicator than a simple pill.
- Preserve the fixed, glassy behavior while making it feel less generic.

## Dashboard Changes

### Shell

- Make the sidebar and top bar feel more unified with the landing page language.
- Strengthen active states, hover states, and section labels.
- Add more depth to the shell so it feels like an operating environment.

### Widgets

- Preserve current widget content and structure, but increase visual hierarchy.
- Make cards feel more stacked, layered, and premium.
- Use clearer accent logic for progress, alerts, and live status.

### Utility Surfaces

- Standardize chips, stat tiles, small badges, and micro-panels so the dashboard feels coherent.
- Keep the dashboard readable at a glance even with stronger styling.

## Motion

- Use staggered reveal motion on page load and section entry.
- Keep one or two standout animations, such as shimmer, float, or scanline effects, on the hero and featured cards.
- Avoid constant motion everywhere.
- Respect reduced-motion preferences fully.

## Accessibility And Performance

- Preserve or improve contrast on all primary text and controls.
- Keep focus rings obvious and consistent.
- Avoid relying on color or glow alone to communicate state.
- Keep animations lightweight and avoid expensive effects on every element.
- Do not introduce layout shifts or hidden content that harms the reading order.

## Implementation Notes

- Prefer incremental component-level styling updates over a wholesale rewrite.
- Reuse existing component structure where possible.
- Update shared styling tokens and utility classes first, then apply them to landing and dashboard surfaces.
- Keep the visual language consistent across public and authenticated areas.

## Acceptance Criteria

- The landing page reads as more dramatic and premium than the current version.
- The dashboard feels like a polished control center rather than a standard admin shell.
- The redesign remains legible on desktop and usable on mobile.
- Existing content and flows still work without functional regressions.

## Verification

- Run lint, type-check, and production build after the UI changes land.
- Verify the landing page and dashboard visually in the browser.
- Check that reduced-motion mode still produces a calm, stable experience.
