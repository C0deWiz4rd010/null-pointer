# NULL_POINTER

```
 _   _ _   _ _     _       ____  ___ ___ _   _ _____ _____ ____
| \ | | | | | |   | |     |  _ \/ _ \_ _| \ | |_   _| ____|  _ \
|  \| | | | | |   | |     | |_) | | | | ||  \| | | | |  _| | |_) |
| |\  | |_| | |___| |___  |  __/| |_| | || |\  | | | | |___|  _ <
|_| \_|\___/|_____|_____| |_|    \___/___|_| \_| |_| |_____|_| \_\
```

> A hex-grid roguelite deck-builder set in a cyberpunk operating system.  
> Debug corrupted daemons, exploit memory vulnerabilities, and survive the kernel.

**[Play Now on GitHub Pages](https://c0dewiz4rd010.github.io/null-pointer/)**

---

## Gameplay

You are a rogue process navigating a corrupted OS. Each encounter places you on a **hex grid** against hostile daemons. Use **opcode cards** to attack, move, and manipulate the battlefield — then spend your winnings on new exploits for the next fight.

### Core Mechanics

| System | Description |
|--------|-------------|
| **Hex Grid** | Axial-coordinate grid with field zones (0x0D, 0x0A, 0x80…) that trigger special effects |
| **CPU / Cards** | Each card costs CPU cycles; hand refills each round |
| **Status Effects** | Burn, Root, Vulnerable, Regen, Shield Break, and more |
| **Relics** | Passive upgrades that persist across the run |
| **Phase 2 Enemies** | Bosses escalate behavior at 50% HP |
| **Run Progression** | 4 encounters → Victory; draft new cards and relics between fights |

### Card Categories

- **Opcodes (OP-)** — Standard attacks, movement (JMP), and utility
- **Deep Packets (DP-)** — Advanced exploits: heap spray, use-after-free, format strings
- **System Calls (SC-)** — fork, mmap, malloc, SIGTERM, chmod

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1`–`5` | Select card in hand |
| `E` | End turn |
| `D` | Open deck viewer |
| `Esc` | Cancel selection / close overlay |
| `M` | Toggle mute |

---

## Tech Stack

- **TypeScript** — strict mode, ESModules
- **Vite** — build tooling and dev server
- **Pixi.js 7** — hex grid canvas rendering, floating damage numbers
- **Web Audio API** — synthesized sound effects (no assets)
- **Vitest** — unit tests for combat engine and grid

---

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Production build
npm run build
```

### Project Structure

```
src/
├── game/
│   ├── cards/          # CardDefinition types + 52-card library
│   ├── combat/         # CombatSystem engine (state machine)
│   └── grid/           # HexGrid, A* pathfinding, axial coords
├── renderer/           # PixiRenderer — canvas rendering
├── audio/              # SoundSystem — Web Audio synthesis
└── ui/                 # NullPointerApp — main UI controller
tests/                  # Vitest unit tests
docs/                   # Design documents
```

---

## Enemy Encounters

| Enemy | Archetype | Behavior |
|-------|-----------|----------|
| `cron.d` | scheduler | Melee attacks, phase 2: rapid multi-hit |
| `heap.warden` | sentinel | Applies Vulnerable, phase 2: shield break |

---

## License

MIT — build your own exploits.
