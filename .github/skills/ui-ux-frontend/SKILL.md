---
name: ui-ux-frontend
description: Design and implement UI/UX for the NULL_POINTER browser game and similar frontend-heavy experiences. Use when shaping HUDs, card hands, menus, onboarding flows, responsive layouts, typography, color systems, motion, accessibility, or the neon-ASCII visual language.
argument-hint: Describe the screen, flow, or frontend surface to design or improve.
---
# UI/UX Frontend Skill

Use this skill when the task is about visual direction, layout, interface behavior, responsiveness, readability, or user flow.

Primary references:

- [Primary design source](../../../docs/NULL_POINTER_Primary_Source.md)
- [Implementation plan](../../../docs/NULL_POINTER_Kartenset_Implementierungsplan.md)

## Design intent

NULL_POINTER should feel like a corrupted terminal fantasy: readable, high-contrast, playful, dangerous, and unmistakably technical.

Preserve these anchors from the source docs:

- neon terminal palette with green, magenta, cyan, red, yellow, and deep blue
- monospace-forward typography such as VT323 and Fira Code
- CRT mood: scanlines, glow, vignette, subtle glitch, occasional flicker
- HTML/CSS overlays for cards, HUD, menus, and modal flows
- PixiJS or canvas-backed playfield for particles and board-space feedback

## Workflow

1. Identify the exact player task on the screen.
2. Decide the information hierarchy before styling details.
3. Keep combat readability ahead of decorative effects.
4. Add one strong visual idea instead of many weak ones.
5. Verify desktop and mobile behavior.

## Frontend rules

- Avoid generic dashboard layouts and default component-library aesthetics.
- Make action states obvious: playable, selected, disabled, dangerous, spent, buffed, debuffed.
- Reserve the brightest effects for gameplay-significant moments.
- Use motion to explain state changes, not as filler.
- Ensure text remains legible over glow, gradients, and CRT overlays.
- Prefer semantic HTML and keyboard-safe interactions for menus and overlays.

## Screen-specific guidance

For combat HUDs:

- Keep enemy state, player state, CPU, armor, stack, and position visible without modal friction.
- Make card cost and outcome scannable in under one second.
- Distinguish board-space information from hand information.

For menus and meta progression:

- Lean into terminal-fiction framing: boot, load, inspect, reboot, dumpcore.
- Use strong typography and framing rather than heavy illustration.

For responsive behavior:

- Desktop: full board plus hand and telemetry.
- Tablet: compress side telemetry and allow horizontal card scroll if needed.
- Mobile: simplify density, stack information vertically, and reduce decorative noise before reducing clarity.

## Accessibility baseline

- Maintain strong contrast for body text and actionable labels.
- Do not encode state with color alone.
- Preserve focus visibility for all keyboard-interactive controls.
- Keep animation optional or subtle when it could impair readability.

## Deliverables

When using this skill, produce one or more of:

- a screen strategy
- a visual direction with concrete tokens
- implementation guidance for HTML/CSS and interaction states
- a focused critique of an existing UI surface
