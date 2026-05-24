---
name: browser-game-systems
description: Build gameplay systems for browser games with a focus on deterministic loops, data-driven content, grid movement, combat rules, and performant rendering. Use when implementing or planning game logic, card engines, battle systems, replay-safe RNG, balancing hooks, or browser-playable vertical slices.
argument-hint: Describe the gameplay system, prototype, or engine slice to build.
---
# Browser Game Systems Skill

Use this skill for gameplay engineering, not pure visual polish.

Project references:

- [Primary design source](../../../docs/NULL_POINTER_Primary_Source.md)
- [Implementation plan](../../../docs/NULL_POINTER_Kartenset_Implementierungsplan.md)

## Default technical direction

For NULL_POINTER, prefer:

- Vite for fast iteration
- TypeScript for rules safety
- PixiJS for the board and effects
- HTML/CSS overlays for HUD and cards
- seeded RNG for deterministic runs and replay support
- Vitest for rules and simulation tests

## What this skill optimizes for

- a playable core loop quickly
- clean separation between data, rules, and rendering
- simple effect primitives that scale into many cards
- deterministic state transitions
- easy balancing and test coverage

## Recommended build order

1. Bootstrapping and render loop.
2. State container for battle state.
3. Hex-grid coordinate math and movement.
4. Turn manager and action resolution.
5. Data-driven card schema.
6. Effect engine with reusable primitives.
7. Enemy AI with a small rule set.
8. Validation tests and balance probes.

## Rules design guidance

- Treat cards as data plus effect instructions.
- Prefer a compact library of effect types over ad hoc card-specific code.
- Encode conditions separately from outcomes.
- Keep position checks, stack checks, CPU checks, and status checks composable.
- Keep rendering and audio as reactions to state changes, not as owners of state.

## First playable slice for this project

Aim for:

- one module
- one enemy
- one arena
- draw/play/end-turn loop
- movement on the hex grid
- 10-20 representative cards across damage, defend, move, draw, and one special case
- deterministic combat test coverage for the implemented rules

## Balancing heuristics

- Build instrumentation before broad content expansion.
- Track per-card cost, effective value, and win-impact once combat is playable.
- Validate high-variance cards with repeated seeded simulations.
- Avoid adding all 150 cards before the effect engine and balance probes exist.

## Validation checklist

- state updates are deterministic
- turn transitions cannot double-fire
- card costs resolve before effects
- position-based effects use one coordinate model consistently
- dead entities stop acting immediately
- tests cover edge cases for damage, armor, healing, movement, and RNG

## Expected outputs

When using this skill, return:

- the smallest viable system boundary
- the next implementation slice
- the validation path for that slice
