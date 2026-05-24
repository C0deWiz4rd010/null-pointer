# Changelog

## [0.1.0] — 2026-05-24

### Added
- Initial public release of NULL_POINTER roguelite
- 52 cards across Opcodes (OP-), Deep Packets (DP-), and System Calls (SC-)
- Full relic system: 8 passive upgrades (SIGKILL, HEAP_GUARD, WATCHDOG, etc.)
- 4-encounter run progression with draft rewards between fights
- Phase 2 enemy behavior (triggered at 50% HP)
- Hex grid field zones: 0x0D (repel), 0x0A (advance), 0x80 (double cost/effect)
- Floating damage numbers via Pixi.js ticker
- Web Audio API sound effects (no asset files required)
- Keyboard shortcuts: 1-5 (cards), E (end turn), D (deck viewer), Esc (cancel)
- GitHub Actions CI/CD pipeline with GitHub Pages auto-deploy

### Fixed
- Class field initialization order bug: `relics` array was undefined when
  `createPlayer()` called `hasRelic()` during field initialization. Fix:
  moved `private relics: Relic[] = []` before `private player` declaration.
- All 24 unit tests passing (combat engine, hex grid, RNG)

### Infrastructure
- Public GitHub repository with MIT license
- Vitest test suite — 24 tests
- TypeScript strict mode throughout
- Vite build system with base path for GitHub Pages (`/null-pointer/`)
