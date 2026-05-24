import { RNG } from '../../core/RNG';
import { HexGrid, sameHex, type HexPos } from '../grid/HexGrid';
import { CARD_LIBRARY, startingDeck } from '../cards/CardLibrary';
import type { CardDefinition, CardEffect, FieldAddress, StatusInstance, StatusKind } from '../cards/types';
import type { CardCondition } from '../cards/types';

// ── Relics ───────────────────────────────────────────────────────────────────

export type RelicId =
  | 'overclock_chip'
  | 'firewall'
  | 'cache_line'
  | 'watchdog_timer'
  | 'stack_frame'
  | 'interrupt_mask'
  | 'memory_leak'
  | 'branch_predictor';

export interface Relic {
  id: RelicId;
  name: string;
  ascii: string;
  description: string;
}

export const RELIC_LIBRARY: Relic[] = [
  {
    id: 'overclock_chip',
    name: 'OVERCLOCK_CHIP',
    ascii: 'CPU_MAX += 2',
    description: '+2 max CPU every combat.',
  },
  {
    id: 'firewall',
    name: 'FIREWALL',
    ascii: 'IPTABLES -A',
    description: 'Start each combat with 6 armor.',
  },
  {
    id: 'cache_line',
    name: 'CACHE_LINE',
    ascii: 'L1_PREFETCH',
    description: 'Draw 1 extra card at the start of each round.',
  },
  {
    id: 'watchdog_timer',
    name: 'WATCHDOG_TIMER',
    ascii: 'WDT_RESET',
    description: 'When HP drops below 25, auto-gain 8 armor (once per combat).',
  },
  {
    id: 'stack_frame',
    name: 'STACK_FRAME',
    ascii: 'PUSH×2',
    description: 'PUSH loads 2 stack entries instead of 1.',
  },
  {
    id: 'interrupt_mask',
    name: 'INTERRUPT_MASK',
    ascii: 'IRQ_MASK',
    description: 'Reduce all damage taken by 2.',
  },
  {
    id: 'memory_leak',
    name: 'MEMORY_LEAK',
    ascii: 'UNCLAIMED_HEAP',
    description: 'Gain 1 extra CPU at the start of each round.',
  },
  {
    id: 'branch_predictor',
    name: 'BRANCH_PREDICTOR',
    ascii: 'SPECULATIVE_EX',
    description: 'The first card played each round costs 1 less CPU.',
  },
];

// ── Run Stats ────────────────────────────────────────────────────────────────

export interface RunStats {
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalCardsPlayed: number;
  totalRoundsSurvived: number;
  enemiesDefeated: number;
  highestSingleHit: number;
}

// ── Damage Events (for floating numbers in renderer) ─────────────────────────

export interface DamageEvent {
  pos: HexPos;
  amount: number;
  kind: 'hit' | 'heal' | 'self';
}

// ── Field Cells ───────────────────────────────────────────────────────────────

export interface FieldCellDef {
  address: FieldAddress;
  pos: HexPos;
  description: string;
}

export const FIELD_CELLS: FieldCellDef[] = [
  { address: '0x0D', pos: { q: -1, r: 0 }, description: 'CR :: on entry push enemy 1 hex, restore 2 HP' },
  { address: '0x0A', pos: { q: 1, r: 0 }, description: 'LF :: on entry advance 1 extra step, gain 1 CPU' },
  { address: '0x80', pos: { q: 0, r: -1 }, description: 'HIGH BIT :: while occupied costs×2 and effects×2' },
  { address: '0x00', pos: { q: 0, r: 0 }, description: 'NULL PTR :: 25% chance cards fail silently' },
  { address: '0xFF', pos: { q: 1, r: -1 }, description: 'OVERFLOW :: +50% damage dealt, lose 10 HP/turn' },
  { address: '0x7F', pos: { q: -1, r: 1 }, description: 'DEL :: last played card permanently deleted' },
];

// ── Fighter State ─────────────────────────────────────────────────────────────

export interface FighterState {
  id: string;
  name: string;
  archetype: string;
  hp: number;
  maxHp: number;
  armor: number;
  cpu: number;
  cpuMax: number;
  position: HexPos;
  statuses: StatusInstance[];
  stackCount: number;
  phaseTwo?: boolean;
}

export interface CardPlayability {
  canPlay: boolean;
  reason: string | null;
}

// ── Draft Items ────────────────────────────────────────────────────────────────

export type DraftItem =
  | { kind: 'card'; card: CardDefinition }
  | { kind: 'relic'; relic: Relic };

// ── Combat Snapshot ───────────────────────────────────────────────────────────

export interface CombatSnapshot {
  round: number;
  player: FighterState;
  enemy: FighterState;
  enemies: FighterState[];
  hand: CardDefinition[];
  drawPileCount: number;
  discardPileCount: number;
  deckSize: number;
  log: string[];
  selectedCardId: string | null;
  enemyIntent: string;
  enemyIntents: string[];
  grid: HexGrid;
  canEndTurn: boolean;
  playability: Record<string, CardPlayability>;
  validTargetHexes: HexPos[];
  fieldCells: FieldCellDef[];
  playerFieldAddress: FieldAddress | null;
  enemyFieldAddress: FieldAddress | null;
  combatOutcome: 'ongoing' | 'victory' | 'defeat';
  playerStackCount: number;
  relics: Relic[];
  encounterNumber: number;
  maxEncounters: number;
  runStats: RunStats;
  deckContents: CardDefinition[];
}

// ── Internal interfaces ────────────────────────────────────────────────────────

interface EffectContext {
  effectMul?: number;
  totalDmgMul?: number;
  targetHex?: HexPos;
  primaryTarget?: FighterState;
  aoeEnemies?: FighterState[];
}

interface EnemyTemplate {
  id: string;
  name: string;
  archetype: string;
  hp: number;
  cpu: number;
  position: HexPos;
  behavior: 'scheduler' | 'sentinel' | 'collector' | 'panicker' | 'minion';
  act?: number;
  intro: string;
  phase2Intro: string;
}

interface CombatSystemOptions {
  deck?: CardDefinition[];
  encounterId?: string;
  seed?: string;
  playerStart?: HexPos;
  enemyStart?: HexPos;
}

// ── Enemy Templates ───────────────────────────────────────────────────────────

const ENEMIES: EnemyTemplate[] = [
  {
    id: 'cron-d',
    name: 'cron.d',
    archetype: 'scheduler daemon',
    hp: 72,
    cpu: 6,
    position: { q: 0, r: -2 },
    behavior: 'scheduler',
    intro: 'cron.d detected :: schedules pain on a fixed interval.',
    phase2Intro: 'PHASE 2 :: cron.d accelerates — interval reduced to 3 rounds!',
  },
  {
    id: 'heap-warden',
    name: 'heap.warden',
    archetype: 'memory sentinel',
    hp: 64,
    cpu: 7,
    position: { q: 1, r: -2 },
    behavior: 'sentinel',
    intro: 'heap.warden engaged :: quarantines unstable pointers.',
    phase2Intro: 'PHASE 2 :: heap.warden hardens — fortress mode active!',
  },
  {
    id: 'gc-daemon',
    name: 'gc.daemon',
    archetype: 'garbage collector',
    hp: 88,
    cpu: 8,
    position: { q: 0, r: -2 },
    behavior: 'collector',
    act: 2,
    intro: 'gc.daemon online :: sweeping all allocated stack memory.',
    phase2Intro: 'PHASE 2 :: gc.daemon frenzied — corrupting your hand!',
  },
  {
    id: 'kernel-panic',
    name: 'kernel.panic',
    archetype: 'system fault daemon',
    hp: 100,
    cpu: 9,
    position: { q: 1, r: -2 },
    behavior: 'panicker',
    act: 2,
    intro: 'kernel.panic triggered :: BSOD sequence initiated. FINAL BOSS.',
    phase2Intro: 'PHASE 2 :: kernel.panic BERSERK — damage escalation doubled!',
  },
];

const PROC_LEAK: EnemyTemplate = {
  id: 'proc-leak',
  name: 'proc.leak',
  archetype: 'orphaned process',
  hp: 36,
  cpu: 4,
  position: { q: -1, r: -1 },
  behavior: 'minion',
  intro: '',
  phase2Intro: '',
};

const BASE_PLAYER = {
  id: 'segment-0x00',
  name: 'Segment_0x00',
  archetype: 'kernel module',
  hp: 80,
  maxHp: 80,
  armor: 0,
  cpu: 8,
  cpuMax: 8,
};

const DEFAULT_SEED = 'NULL_POINTER_VERTICAL_SLICE';
const MAX_ENCOUNTERS = 4;

// ── Combat System ─────────────────────────────────────────────────────────────

export class CombatSystem {
  private readonly rng: RNG;

  readonly grid = new HexGrid(2);

  private baseDeck: CardDefinition[];

  private readonly playerStart: HexPos;

  private readonly enemyStartOverride?: HexPos;

  private enemyIndex = 0;

  // Run-level state — must be declared before player so hasRelic() works during field init
  private relics: Relic[] = [];

  private player: FighterState = this.createPlayer();

  private enemies: FighterState[] = [];

  private get enemy(): FighterState { return this.enemies[0]; }

  private round = 1;

  private drawPile: CardDefinition[] = [];

  private discardPile: CardDefinition[] = [];

  private hand: CardDefinition[] = [];

  private selectedCardId: string | null = null;

  private enemySkipTurns = 0;

  private pendingTriggers: Array<{ kind: 'damageMultiplier'; value: number }> = [];

  private readonly log: string[] = [];

  private runEncounterNumber = 1;

  private runStats: RunStats = this.createBlankStats();

  // Per-combat state
  private phase2Triggered = new Set<string>();

  private watchdogArmed = true;

  private firstCardThisRound = true;

  // Damage events for floating numbers
  private pendingDamageEvents: DamageEvent[] = [];

  constructor(options: CombatSystemOptions = {}) {
    this.rng = new RNG(options.seed ?? DEFAULT_SEED);
    this.baseDeck = options.deck ?? startingDeck();
    this.playerStart = options.playerStart ?? { q: 0, r: 2 };
    this.enemyStartOverride = options.enemyStart;
    this.enemyIndex = this.findEnemyIndex(options.encounterId);
    this.reset(this.currentEnemyTemplate.id);
  }

  get currentEnemyTemplate(): EnemyTemplate {
    return ENEMIES[this.enemyIndex];
  }

  snapshot(): CombatSnapshot {
    const selectedCard = this.selectedCardId
      ? this.hand.find((c) => c.id === this.selectedCardId) ?? null
      : null;

    const intents = this.computeEnemyIntents();
    const combatOver = this.player.hp <= 0 || this.enemies.every((e) => e.hp <= 0);

    return {
      round: this.round,
      player: this.cloneFighter(this.player),
      enemy: this.cloneFighter(this.enemy),
      enemies: this.enemies.map((e) => this.cloneFighter(e)),
      hand: [...this.hand],
      drawPileCount: this.drawPile.length,
      discardPileCount: this.discardPile.length,
      deckSize: this.baseDeck.length,
      log: [...this.log],
      selectedCardId: this.selectedCardId,
      enemyIntent: intents[0] ?? 'IDLE',
      enemyIntents: intents,
      grid: this.grid,
      canEndTurn: !combatOver,
      playability: Object.fromEntries(this.hand.map((card) => [card.id, this.evaluateCardPlayability(card)])),
      validTargetHexes: selectedCard ? this.getValidTargets(selectedCard) : [],
      fieldCells: FIELD_CELLS,
      playerFieldAddress: this.getFieldAddress(this.player.position),
      enemyFieldAddress: this.getFieldAddress(this.enemy.position),
      combatOutcome: this.player.hp <= 0 ? 'defeat' : this.enemies.every((e) => e.hp <= 0) ? 'victory' : 'ongoing',
      playerStackCount: this.player.stackCount,
      relics: [...this.relics],
      encounterNumber: this.runEncounterNumber,
      maxEncounters: MAX_ENCOUNTERS,
      runStats: { ...this.runStats },
      deckContents: [...this.baseDeck],
    };
  }

  /** Drain and return all pending damage/heal events since the last call. */
  takeDamageEvents(): DamageEvent[] {
    const events = [...this.pendingDamageEvents];
    this.pendingDamageEvents = [];
    return events;
  }

  selectCard(cardId: string): void {
    this.selectedCardId = this.selectedCardId === cardId ? null : cardId;
  }

  addCardToDeck(card: CardDefinition): void {
    this.baseDeck = [...this.baseDeck, card];
    this.drawPile.push(card);
    this.pushLog(`ACQUIRED :: ${card.name} installed into memory.`);
  }

  addRelic(relic: Relic): void {
    if (this.relics.some((r) => r.id === relic.id)) return;
    this.relics.push(relic);
    this.pushLog(`RELIC EQUIPPED :: ${relic.name} — ${relic.description}`);
  }

  /** Returns draft items for the post-encounter reward screen.
   *  Encounter 2 includes one relic option alongside cards. */
  getDraftItems(): DraftItem[] {
    const deckCounts = this.baseDeck.reduce<Record<string, number>>((acc, c) => {
      acc[c.id] = (acc[c.id] ?? 0) + 1;
      return acc;
    }, {});
    const cardPool = CARD_LIBRARY.filter((c) => (deckCounts[c.id] ?? 0) < 2);
    const shuffled = this.rng.shuffle([...cardPool]);

    const includeRelic = this.runEncounterNumber === 2;
    const cardCount = includeRelic ? 2 : 3;
    const cards: DraftItem[] = shuffled.slice(0, cardCount).map((card) => ({ kind: 'card', card }));

    if (includeRelic) {
      const ownedIds = new Set(this.relics.map((r) => r.id));
      const relicPool = RELIC_LIBRARY.filter((r) => !ownedIds.has(r.id));
      if (relicPool.length > 0) {
        const relic = this.rng.shuffle([...relicPool])[0];
        cards.push({ kind: 'relic', relic });
      } else {
        // All relics owned – add a third card instead
        if (shuffled[2]) cards.push({ kind: 'card', card: shuffled[2] });
      }
    }

    return cards;
  }

  /** Advance to the next encounter. Increments run counter and resets combat. */
  advanceEncounter(): void {
    this.runEncounterNumber += 1;
    if (this.runEncounterNumber <= MAX_ENCOUNTERS) {
      const next = ENEMIES[(this.enemyIndex + 1) % ENEMIES.length];
      this.reset(next.id);
    }
  }

  /** Legacy alias kept for backwards-compat. */
  cycleEnemyProfile(): void {
    this.advanceEncounter();
  }

  playCard(cardId: string, targetHex?: HexPos): void {
    const handIndex = this.hand.findIndex((card) => card.id === cardId);
    if (handIndex === -1 || this.player.hp <= 0 || this.enemies.every((e) => e.hp <= 0)) return;

    const card = this.hand[handIndex];
    const playability = this.evaluateCardPlayability(card);
    if (!playability.canPlay) {
      this.pushLog(`Rule fault :: ${card.name} ${playability.reason?.toLowerCase() ?? 'unavailable'}.`);
      return;
    }

    const targetFault = this.validateTargetSelection(card, targetHex);
    if (targetFault) {
      this.pushLog(`Target fault :: ${card.name} ${targetFault}.`);
      return;
    }

    // HIGH BIT field doubles cost/effects
    const highBit = this.isPlayerOnField('0x80');
    let cpuCost = highBit ? card.cost * 2 : card.cost;
    const effectMul = highBit ? 2 : 1;
    if (highBit) this.pushLog(`HIGH BIT field :: costs doubled to ${cpuCost} CPU.`);

    // Branch predictor relic: first card each round costs 1 less
    if (this.firstCardThisRound && this.hasRelic('branch_predictor')) {
      cpuCost = Math.max(0, cpuCost - 1);
      this.pushLog('BRANCH_PREDICTOR :: first card costs -1 CPU.');
    }
    this.firstCardThisRound = false;

    // Consume pending damage-multiplier trigger
    let damageTriggerMul = 1;
    const triggerIdx = this.pendingTriggers.findIndex((t) => t.kind === 'damageMultiplier');
    if (triggerIdx >= 0) {
      damageTriggerMul = this.pendingTriggers[triggerIdx].value;
      this.pendingTriggers.splice(triggerIdx, 1);
      this.pushLog(`Trigger consumed :: next-play damage ×${damageTriggerMul}.`);
    }

    const totalDmgMul = effectMul * damageTriggerMul;

    this.player.cpu -= cpuCost;
    this.hand.splice(handIndex, 1);
    this.discardPile.push(card);
    this.selectedCardId = null;
    this.runStats.totalCardsPlayed += 1;
    this.pushLog(`PLAY ${card.name} :: ${card.ascii}`);

    // NULL PTR field: 25% card fail chance
    if (this.isPlayerOnField('0x00') && this.rng.float() < 0.25) {
      this.pushLog(`NULL PTR fault :: ${card.name} dereferenced to void.`);
      return;
    }

    // OVERFLOW field: +50% damage multiplier
    const overflowBoost = this.isPlayerOnField('0xFF') ? 1.5 : 1;
    const finalDmgMul = totalDmgMul * overflowBoost;
    const primaryTarget = this.resolvePrimaryTarget(card, targetHex);

    const aoeEnemies =
      card.target === 'aoe'
        ? this.enemies.filter((e) => e.hp > 0).filter((e) => {
            const range = card.range ?? { min: 0, max: 2 };
            const anchor = targetHex ?? this.player.position;
            return this.grid.distance(anchor, e.position) >= range.min
              && this.grid.distance(anchor, e.position) <= range.max;
          })
        : undefined;

    for (const effect of card.effects) {
      this.resolveEffect(effect, { effectMul, totalDmgMul: finalDmgMul, targetHex, primaryTarget, aoeEnemies });
      if (this.enemies.every((e) => e.hp <= 0)) break;
    }

    // DEL field: permanently delete the last played card
    if (this.isPlayerOnField('0x7F')) {
      this.baseDeck = this.baseDeck.filter((c, i) => {
        if (c.id === card.id && i === this.baseDeck.lastIndexOf(c)) return false;
        return true;
      });
      this.pushLog(`Field 0x7F DEL :: ${card.name} permanently erased.`);
    }
  }

  endTurn(): void {
    if (this.player.hp <= 0 || this.enemies.every((e) => e.hp <= 0)) return;

    this.expireStatuses(this.player, 'player');
    this.pushLog(`ROUND ${this.round} -> enemy phase`);

    for (const e of this.enemies.filter((en) => en.hp > 0)) {
      this.applyStartOfTurnStatuses(e, 'enemy');
    }
    if (this.enemies.every((e) => e.hp <= 0)) return;

    if (this.enemySkipTurns > 0) {
      this.enemySkipTurns -= 1;
      this.pushLog('All enemies halted :: skip this cycle.');
    } else {
      this.runEnemyTurn();
    }

    for (const e of this.enemies) this.expireStatuses(e, 'enemy');

    if (this.enemies.some((e) => e.hp > 0)) {
      this.round += 1;
      this.runStats.totalRoundsSurvived += 1;
      this.player.armor = 0;
      this.player.cpu = this.player.cpuMax;
      for (const e of this.enemies) { e.armor = 0; e.cpu = e.cpuMax; }

      // MEMORY_LEAK relic: +1 bonus CPU per round
      if (this.hasRelic('memory_leak')) {
        this.player.cpu = Math.min(this.player.cpuMax, this.player.cpu + 1);
        this.pushLog('MEMORY_LEAK :: +1 unclaimed CPU cycle.');
      }

      this.firstCardThisRound = true;
      this.pushLog(`ROUND ${this.round} :: CPU restored, armor purged.`);
      this.applyStartOfTurnStatuses(this.player, 'player');
      if (this.player.hp > 0) {
        this.applyFieldEffectsForPlayer();
        const extra = this.hasRelic('cache_line') ? 1 : 0;
        this.drawCards(Math.max(0, 5 + extra - this.hand.length));
      }
    }
  }

  reset(encounterId = this.currentEnemyTemplate.id): void {
    this.enemyIndex = this.findEnemyIndex(encounterId);
    this.player = this.createPlayer();
    this.enemies = [
      this.createEnemy(this.currentEnemyTemplate),
      this.createEnemyFixed(PROC_LEAK),
    ];
    this.round = 1;
    this.drawPile = this.rng.shuffle([...this.baseDeck]);
    this.discardPile = [];
    this.hand = [];
    this.selectedCardId = null;
    this.enemySkipTurns = 0;
    this.pendingTriggers = [];
    this.phase2Triggered.clear();
    this.watchdogArmed = true;
    this.firstCardThisRound = true;
    this.log.length = 0;
    this.pendingDamageEvents = [];
    this.drawCards(5);
    this.pushLog('BOOT OK :: Combat initialized.');
    this.pushLog(this.currentEnemyTemplate.intro);
  }

  /** Full run reset (new game). */
  fullReset(): void {
    this.relics = [];
    this.runEncounterNumber = 1;
    this.runStats = this.createBlankStats();
    this.baseDeck = startingDeck();
    this.enemyIndex = 0;
    this.reset(ENEMIES[0].id);
  }

  // ── Effect resolution ──────────────────────────────────────────────────────

  private resolveEffect(effect: CardEffect, context: EffectContext = {}): void {
    const mul = context.effectMul ?? 1;
    const dmgMul = context.totalDmgMul ?? 1;

    if (effect.condition && !this.evaluateCondition(effect.condition)) {
      this.pushLog(`Condition [${effect.condition.kind}] :: not met, effect skipped.`);
      return;
    }

    switch (effect.type) {
      case 'damage': {
        if (context.aoeEnemies) {
          for (const t of context.aoeEnemies) this.applyDamage(t, Math.round(effect.value * dmgMul), 'enemy');
          if (context.aoeEnemies.length === 0) this.pushLog('AoE :: no targets in range.');
        } else {
          this.applyDamage(context.primaryTarget ?? this.enemy, Math.round(effect.value * dmgMul), 'enemy');
        }
        break;
      }
      case 'heal': {
        const amount = Math.round(effect.value * mul);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
        this.pendingDamageEvents.push({ pos: { ...this.player.position }, amount, kind: 'heal' });
        this.pushLog(`Patch applied :: +${amount} integrity.`);
        break;
      }
      case 'selfDamage': {
        const amount = effect.value;
        this.player.hp = Math.max(0, this.player.hp - amount);
        this.runStats.totalDamageTaken += amount;
        this.pendingDamageEvents.push({ pos: { ...this.player.position }, amount, kind: 'self' });
        this.pushLog(`Self-inflicted :: -${amount} HP (dangerous operation).`);
        if (this.player.hp === 0) this.pushLog('KERNEL PANIC :: Segment_0x00 terminated.');
        break;
      }
      case 'gainCpu':
        this.player.cpu = Math.min(this.player.cpuMax, this.player.cpu + Math.round(effect.value * mul));
        this.pushLog(`CPU reclaimed :: +${Math.round(effect.value * mul)} cycles.`);
        break;
      case 'moveSelf':
        if (this.hasStatus(this.player, 'root')) {
          this.pushLog('Movement denied :: root lock blocks movement.');
          break;
        }
        if (context.targetHex) {
          this.movePlayerTo(context.targetHex, 'Jump complete');
        } else {
          let dest = { ...this.player.position };
          for (let i = 0; i < effect.value; i += 1) {
            dest = this.grid.stepToward(dest, this.enemy.position, [this.enemy.position]);
          }
          this.movePlayerTo(dest, 'Jump complete');
        }
        break;
      case 'draw':
        this.drawCards(effect.value);
        this.pushLog(`Stack warmed :: drew ${effect.value} card${effect.value === 1 ? '' : 's'}.`);
        break;
      case 'armor':
        this.applyArmor(this.player, Math.round(effect.value * mul), 'player');
        break;
      case 'enemyCpuLoss': {
        const tgt = context.primaryTarget ?? this.enemy;
        const drain = Math.round(effect.value * mul);
        tgt.cpu = Math.max(0, tgt.cpu - drain);
        this.pushLog(`${tgt.name} throttled :: -${drain} CPU.`);
        break;
      }
      case 'enemyArmorBreak': {
        const tgt = context.primaryTarget ?? this.enemy;
        tgt.armor = Math.max(0, tgt.armor - effect.value);
        this.pushLog(`Armor stripped :: ${tgt.name} loses ${effect.value} armor.`);
        break;
      }
      case 'skipEnemyTurn':
        this.enemySkipTurns += effect.value;
        this.pushLog('Interrupt registered :: enemy turn queued to skip.');
        break;
      case 'applyStatus':
        if (context.aoeEnemies && effect.target !== 'self') {
          for (const t of context.aoeEnemies) {
            this.applyStatus(t, effect.status ?? 'burn', Math.round(effect.value * mul), effect.duration ?? 1, 'enemy');
          }
        } else {
          const tgt = effect.target === 'self' ? this.player : (context.primaryTarget ?? this.enemy);
          const owner = effect.target === 'self' ? 'player' : 'enemy';
          this.applyStatus(tgt, effect.status ?? 'burn', Math.round(effect.value * mul), effect.duration ?? 1, owner);
        }
        break;
      case 'push': {
        const tgt = context.primaryTarget ?? this.enemy;
        const pushed = this.grid.pushFrom(this.player.position, tgt.position, effect.value, [this.player.position]);
        tgt.position = pushed;
        this.pushLog(`Push :: ${tgt.name} displaced to ${this.formatPos(tgt.position)}.`);
        this.applyEnemyFieldEntryEffects(tgt);
        break;
      }
      case 'pull': {
        const tgt = context.primaryTarget ?? this.enemy;
        let pullPos = { ...tgt.position };
        for (let i = 0; i < effect.value; i += 1) {
          const next = this.grid.stepToward(pullPos, this.player.position, [this.player.position]);
          if (sameHex(next, pullPos)) break;
          pullPos = next;
        }
        tgt.position = pullPos;
        this.pushLog(`Pull :: ${tgt.name} reeled to ${this.formatPos(tgt.position)}.`);
        this.applyEnemyFieldEntryEffects(tgt);
        break;
      }
      case 'cleanse': {
        const NEG: StatusKind[] = ['burn', 'shieldBreak', 'root', 'vulnerable'];
        const removed = this.player.statuses.filter((s) => NEG.includes(s.kind)).map((s) => s.kind);
        this.player.statuses = this.player.statuses.filter((s) => !NEG.includes(s.kind));
        this.pushLog(removed.length > 0
          ? `Cleanse :: removed ${removed.map(formatStatusLabel).join(', ')}.`
          : 'Cleanse :: no debuffs to remove.');
        break;
      }
      case 'regen':
        this.applyStatus(this.player, 'regen', Math.round(effect.value * mul), effect.duration ?? 3, 'player');
        break;
      case 'onNextPlayDamage':
        this.pendingTriggers.push({ kind: 'damageMultiplier', value: effect.value });
        this.pushLog(`Trigger armed :: next card deals ×${effect.value} damage.`);
        break;
      case 'stackPush': {
        const pushAmount = this.hasRelic('stack_frame') ? effect.value * 2 : effect.value;
        this.player.stackCount += pushAmount;
        this.pushLog(`Stack loaded :: ${this.player.stackCount} entr${this.player.stackCount === 1 ? 'y' : 'ies'} on stack.`);
        if (this.player.stackCount > 8) {
          this.applyDamage(this.player, 20, 'player');
          this.player.stackCount = 0;
          this.pushLog('STACK OVERFLOW :: −20 HP, stack flushed.');
        }
        break;
      }
      case 'stackPop': {
        const avail = this.player.stackCount;
        if (avail > 0) {
          const popped = Math.min(avail, effect.value);
          this.player.stackCount -= popped;
          const burst = Math.round(popped * 4 * dmgMul);
          this.applyDamage(context.primaryTarget ?? this.enemy, burst, 'enemy');
          this.pushLog(`Stack pop :: ${popped} entries freed → ${burst} burst damage.`);
        } else {
          this.pushLog('Stack empty :: POP yields nothing.');
        }
        break;
      }
      case 'damagePerStack': {
        const entries = Math.max(1, this.player.stackCount);
        const total = Math.round(entries * effect.value * dmgMul);
        this.applyDamage(context.primaryTarget ?? this.enemy, total, 'enemy');
        this.pushLog(`LOOP :: ${entries} iter${entries === 1 ? '' : 's'} → ${total} damage (stack intact).`);
        break;
      }
      default:
        throw new Error(`Unsupported effect: ${(effect as CardEffect).type}`);
    }
  }

  // ── Enemy AI ───────────────────────────────────────────────────────────────

  private runEnemyTurn(): void {
    if (this.enemy.hp > 0) {
      switch (this.currentEnemyTemplate.behavior) {
        case 'scheduler': this.runSchedulerTurn(); break;
        case 'sentinel':  this.runSentinelTurn();  break;
        case 'collector': this.runCollectorTurn(); break;
        default:          this.runPanickerTurn();  break;
      }
    }
    for (const minion of this.enemies.slice(1).filter((e) => e.hp > 0)) {
      this.runMinionTurn(minion);
    }
  }

  private isPhaseTwo(enemy: FighterState): boolean {
    return enemy.hp <= enemy.maxHp * 0.5;
  }

  private checkPhase2Transition(enemy: FighterState, template: EnemyTemplate): void {
    if (this.isPhaseTwo(enemy) && !this.phase2Triggered.has(enemy.id)) {
      this.phase2Triggered.add(enemy.id);
      this.pushLog(template.phase2Intro);
      enemy.phaseTwo = true;
    }
  }

  private runMinionTurn(minion: FighterState): void {
    const distance = this.grid.distance(minion.position, this.player.position);
    const p2 = this.isPhaseTwo(minion);

    if (distance > 1) {
      const blockers = [this.player.position, ...this.enemies.filter((e) => e !== minion && e.hp > 0).map((e) => e.position)];
      minion.position = this.grid.stepToward(minion.position, this.player.position, blockers);
      this.applyEnemyFieldEntryEffects(minion);
      this.pushLog(`${minion.name} spreads :: advancing to ${this.formatPos(minion.position)}.`);
      return;
    }
    const dmg = p2 ? 7 : 4;
    if (minion.cpu >= 2) {
      minion.cpu -= 2;
      this.applyDamage(this.player, dmg, 'player');
      this.pushLog(`${minion.name} leaks :: ${dmg} damage.`);
      return;
    }
    this.pushLog(`${minion.name} stalls :: insufficient CPU.`);
  }

  private runSchedulerTurn(): void {
    const distance = this.grid.distance(this.enemy.position, this.player.position);
    const p2 = this.isPhaseTwo(this.enemy);
    this.checkPhase2Transition(this.enemy, this.currentEnemyTemplate);

    const interval = p2 ? 3 : 5;
    const scheduledDmg = p2 ? 14 : 9;
    const meleeDmg = p2 ? 9 : 6;

    if (this.round % interval === 0 && this.enemy.cpu >= 3) {
      this.enemy.cpu -= 3;
      this.applyDamage(this.player, scheduledDmg, 'player');
      this.pushLog(`cron tick :: scheduled task fires for ${scheduledDmg} damage.`);
      if (p2) this.applyArmor(this.enemy, 1, 'enemy');
      return;
    }
    if (distance > 1) {
      if (this.tryMoveTowardPlayer()) this.pushLog(`cron.d repositions :: ${this.formatPos(this.enemy.position)}.`);
      return;
    }
    if (this.enemy.cpu >= 2) {
      this.enemy.cpu -= 2;
      this.applyDamage(this.player, meleeDmg, 'player');
      this.pushLog(`cron.d executes :: ${meleeDmg} melee damage.`);
      return;
    }
    this.applyArmor(this.enemy, p2 ? 3 : 2, 'enemy');
  }

  private runSentinelTurn(): void {
    const distance = this.grid.distance(this.enemy.position, this.player.position);
    const p2 = this.isPhaseTwo(this.enemy);
    this.checkPhase2Transition(this.enemy, this.currentEnemyTemplate);

    if (!this.hasStatus(this.player, 'vulnerable') && distance <= 3 && this.enemy.cpu >= 2) {
      this.enemy.cpu -= 2;
      this.applyStatus(this.player, 'vulnerable', 1, 2, 'player');
      this.pushLog('heap.warden scans :: player marked vulnerable.');
      return;
    }
    if (distance <= 2 && this.enemy.cpu >= 3) {
      this.enemy.cpu -= 3;
      const meleeDmg = p2 ? 7 : 4;
      this.applyDamage(this.player, meleeDmg, 'player');
      this.applyStatus(this.player, 'root', 1, 1, 'player');
      if (p2) this.applyStatus(this.player, 'shieldBreak', 1, 2, 'player');
      this.pushLog(`heap.warden quarantines :: ${meleeDmg} dmg + root${p2 ? ' + shieldBreak' : ''}.`);
      return;
    }
    if (distance > 2) {
      if (this.tryMoveTowardPlayer()) this.pushLog(`heap.warden advances :: ${this.formatPos(this.enemy.position)}.`);
      return;
    }
    this.applyArmor(this.enemy, p2 ? 5 : 3, 'enemy');
    this.pushLog(`heap.warden hardens :: +${p2 ? 5 : 3} armor.`);
  }

  private runCollectorTurn(): void {
    const distance = this.grid.distance(this.enemy.position, this.player.position);
    const p2 = this.isPhaseTwo(this.enemy);
    this.checkPhase2Transition(this.enemy, this.currentEnemyTemplate);

    if (this.player.stackCount > 0 && distance <= 2) {
      const swept = this.player.stackCount;
      const dmg = 5 + swept;
      this.player.stackCount = 0;
      this.applyDamage(this.player, dmg, 'player');
      if (p2 && this.hand.length > 0) {
        const idx = Math.floor(this.rng.float() * this.hand.length);
        const discarded = this.hand.splice(idx, 1)[0];
        this.discardPile.push(discarded);
        this.pushLog(`gc.daemon frenzied :: discards ${discarded.name} from your hand!`);
      }
      this.pushLog(`gc.daemon sweeps :: ${swept} stack entries + ${dmg} damage.`);
      return;
    }
    if (distance > 2) {
      if (this.tryMoveTowardPlayer()) this.pushLog(`gc.daemon scans :: advancing ${this.formatPos(this.enemy.position)}.`);
      return;
    }
    const burnVal = p2 ? 3 : 2;
    this.applyStatus(this.player, 'burn', burnVal, 2, 'player');
    this.pushLog(`gc.daemon corrupts :: burn ${burnVal} applied.`);
  }

  private runPanickerTurn(): void {
    const distance = this.grid.distance(this.enemy.position, this.player.position);
    const p2 = this.isPhaseTwo(this.enemy);
    this.checkPhase2Transition(this.enemy, this.currentEnemyTemplate);

    if (distance > 1) {
      this.tryMoveTowardPlayer();
      this.pushLog(`kernel.panic cascades :: ${this.formatPos(this.enemy.position)}.`);
      return;
    }
    const mul = p2 ? 3 : 2;
    const dmg = Math.min(this.round * mul, p2 ? 30 : 20);
    this.applyDamage(this.player, dmg, 'player');
    if (p2) this.applyStatus(this.player, 'burn', 2, 2, 'player');
    this.pushLog(`kernel.panic executes :: ${dmg} damage (round ${this.round}${p2 ? ', BERSERK' : ''}).`);
  }

  // ── Draw / Damage helpers ──────────────────────────────────────────────────

  private drawCards(count: number): void {
    for (let i = 0; i < count; i += 1) {
      if (this.drawPile.length === 0) {
        if (this.discardPile.length === 0) return;
        this.drawPile = this.rng.shuffle(this.discardPile);
        this.discardPile = [];
      }
      const next = this.drawPile.shift();
      if (!next) return;
      this.hand.push(next);
    }
  }

  private applyDamage(target: FighterState, amount: number, kind: 'player' | 'enemy'): void {
    let modifiedAmount = amount;

    // Vulnerable multiplier
    const vuln = this.statusValue(target, 'vulnerable');
    if (vuln > 0) modifiedAmount += Math.ceil(amount * 0.5 * vuln);

    // INTERRUPT_MASK relic: reduce player damage by 2
    if (kind === 'player' && this.hasRelic('interrupt_mask')) {
      modifiedAmount = Math.max(0, modifiedAmount - 2);
    }

    const absorbed = Math.min(target.armor, modifiedAmount);
    target.armor -= absorbed;
    const net = Math.max(0, modifiedAmount - absorbed);
    target.hp = Math.max(0, target.hp - net);

    if (net > 0) {
      this.pendingDamageEvents.push({ pos: { ...target.position }, amount: net, kind: 'hit' });
    }

    if (kind === 'player') {
      this.runStats.totalDamageTaken += net;
      // WATCHDOG_TIMER relic
      if (this.watchdogArmed && this.hasRelic('watchdog_timer') && target.hp < 25 && target.hp > 0) {
        this.watchdogArmed = false;
        target.armor += 8;
        this.pushLog('WATCHDOG_TIMER :: hardware interrupt — auto-gained 8 armor!');
      }
    } else {
      if (net > this.runStats.highestSingleHit) this.runStats.highestSingleHit = net;
      this.runStats.totalDamageDealt += net;
    }

    const tag = kind === 'player' ? 'Player' : target.name;
    this.pushLog(`${tag} takes ${net} (${absorbed} blocked).`);

    if (target.hp === 0) {
      if (kind === 'player') {
        this.pushLog('KERNEL PANIC :: Segment_0x00 terminated.');
      } else {
        this.pushLog(`PROCESS KILLED :: ${target.name} removed.`);
        this.runStats.enemiesDefeated += 1;
      }
      // Check phase 2 transition after damage
      if (kind === 'enemy') this.checkPhase2Transition(target, this.currentEnemyTemplate);
    } else if (kind === 'enemy') {
      this.checkPhase2Transition(target, this.currentEnemyTemplate);
    }
  }

  private applyArmor(target: FighterState, amount: number, kind: 'player' | 'enemy'): void {
    if (this.hasStatus(target, 'shieldBreak')) {
      this.pushLog(`${kind === 'player' ? 'Player' : target.name} armor denied :: shield break active.`);
      return;
    }
    target.armor += amount;
    this.pushLog(`${kind === 'player' ? 'Player' : target.name} hardens :: +${amount} armor.`);
  }

  private applyStatus(target: FighterState, kind: StatusKind, value: number, duration: number, owner: 'player' | 'enemy'): void {
    const current = target.statuses.find((s) => s.kind === kind);
    if (current) {
      current.value += value;
      current.duration = Math.max(current.duration, duration);
    } else {
      target.statuses.push({ kind, value, duration });
    }
    if (kind === 'shieldBreak') target.armor = 0;
    const label = owner === 'player' ? 'Player' : target.name;
    this.pushLog(`${label} :: ${formatStatus(kind, value, duration)}.`);
  }

  private applyStartOfTurnStatuses(target: FighterState, owner: 'player' | 'enemy'): void {
    const burn = target.statuses.find((s) => s.kind === 'burn');
    if (burn && burn.duration > 0 && burn.value > 0) {
      this.applyDamage(target, burn.value, owner);
      this.pushLog(`${owner === 'player' ? 'Player' : target.name} burn tick :: ${burn.value}.`);
    }
    const regen = target.statuses.find((s) => s.kind === 'regen');
    if (regen && regen.duration > 0 && regen.value > 0) {
      target.hp = Math.min(target.maxHp, target.hp + regen.value);
      this.pushLog(`${owner === 'player' ? 'Player' : target.name} regen tick :: +${regen.value} HP.`);
    }
  }

  private expireStatuses(target: FighterState, owner: 'player' | 'enemy'): void {
    const expired: StatusKind[] = [];
    target.statuses = target.statuses
      .map((s) => ({ ...s, duration: s.duration - 1 }))
      .filter((s) => {
        if (s.duration <= 0) { expired.push(s.kind); return false; }
        return true;
      });
    if (expired.length > 0) {
      const label = owner === 'player' ? 'Player' : target.name;
      this.pushLog(`${label} status clear :: ${expired.map(formatStatusLabel).join(', ')}.`);
    }
  }

  // ── Field effects ──────────────────────────────────────────────────────────

  private getFieldAddress(pos: HexPos): FieldAddress | null {
    return FIELD_CELLS.find((fc) => sameHex(fc.pos, pos))?.address ?? null;
  }

  private isPlayerOnField(address: FieldAddress): boolean {
    return this.getFieldAddress(this.player.position) === address;
  }

  private applyFieldEffectsForPlayer(): void {
    const addr = this.getFieldAddress(this.player.position);
    if (addr === '0xFF') {
      this.applyDamage(this.player, 10, 'player');
      this.pushLog('Field 0xFF OVERFLOW :: -10 HP burn per turn.');
    }
    if (addr === '0x00') {
      this.pushLog('Field 0x00 NULL :: null pointer zone — 25% card fail this turn.');
    }
  }

  private applyPlayerFieldEntryEffects(): void {
    const addr = this.getFieldAddress(this.player.position);
    if (addr === '0x0D') {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 2);
      this.pendingDamageEvents.push({ pos: { ...this.player.position }, amount: 2, kind: 'heal' });
      this.pushLog('Field 0x0D CR :: +2 HP on entry.');
      for (const e of this.enemies.filter((en) => en.hp > 0)) {
        const pushed = this.grid.pushFrom(this.player.position, e.position, 1, [this.player.position]);
        e.position = pushed;
        this.pushLog(`Field 0x0D CR :: ${e.name} pushed to ${this.formatPos(e.position)}.`);
      }
    }
    if (addr === '0x0A') {
      if (!this.hasStatus(this.player, 'root')) {
        const advanced = this.grid.stepToward(this.player.position, this.enemy.position, [this.enemy.position]);
        if (!sameHex(advanced, this.player.position)) {
          this.player.position = advanced;
          this.pushLog(`Field 0x0A LF :: advanced to ${this.formatPos(this.player.position)}.`);
        }
      }
      this.player.cpu = Math.min(this.player.cpuMax, this.player.cpu + 1);
      this.pushLog('Field 0x0A LF :: +1 CPU on entry.');
    }
  }

  private applyEnemyFieldEntryEffects(enemy: FighterState): void {
    const addr = this.getFieldAddress(enemy.position);
    if (!addr) return;
    switch (addr) {
      case '0xFF':
        this.applyDamage(enemy, 8, 'enemy');
        this.pushLog(`Field 0xFF OVERFLOW :: ${enemy.name} overflows — 8 damage.`);
        break;
      case '0x0D':
        if (!this.hasStatus(enemy, 'root')) {
          const bounced = this.grid.pushFrom(this.player.position, enemy.position, 1, [this.player.position]);
          enemy.position = bounced;
          this.pushLog(`Field 0x0D CR :: ${enemy.name} bounced to ${this.formatPos(enemy.position)}.`);
        }
        break;
      case '0x0A':
        if (!this.hasStatus(enemy, 'root')) {
          const pulled = this.grid.stepToward(enemy.position, this.player.position, [this.player.position]);
          if (!sameHex(pulled, enemy.position)) {
            enemy.position = pulled;
            this.pushLog(`Field 0x0A LF :: ${enemy.name} dragged to ${this.formatPos(enemy.position)}.`);
          }
        }
        break;
      case '0x80':
        enemy.cpu = Math.max(0, enemy.cpu - 2);
        this.pushLog(`Field 0x80 HIGH BIT :: ${enemy.name} CPU drained by 2.`);
        break;
      case '0x7F':
        if (enemy.armor > 0) {
          this.pushLog(`Field 0x7F DEL :: ${enemy.name} armor erased (${enemy.armor} → 0).`);
          enemy.armor = 0;
        }
        break;
      case '0x00':
        if (this.rng.float() < 0.25) {
          this.enemySkipTurns += 1;
          this.pushLog(`Field 0x00 NULL PTR :: ${enemy.name} dereferenced — skips next turn.`);
        }
        break;
    }
  }

  // ── Targeting helpers ──────────────────────────────────────────────────────

  private getValidTargets(card: CardDefinition): HexPos[] {
    if (card.target === 'enemy') {
      const range = card.range ?? { min: 1, max: 1 };
      return this.enemies
        .filter((e) => e.hp > 0)
        .filter((e) => {
          const dist = this.grid.distance(this.player.position, e.position);
          return dist >= range.min && dist <= range.max;
        })
        .map((e) => ({ ...e.position }));
    }
    if (card.target === 'self') {
      const moveEffect = card.effects.find((e) => e.type === 'moveSelf');
      if (moveEffect && !this.hasStatus(this.player, 'root')) {
        return this.grid.reachable(this.player.position, moveEffect.value, [this.enemy.position]);
      }
    }
    if (card.target === 'aoe') {
      const range = card.range ?? { min: 0, max: 2 };
      return this.grid.cells.filter((cell) => {
        const dist = this.grid.distance(this.player.position, cell);
        return dist >= range.min && dist <= range.max && !sameHex(cell, this.player.position);
      });
    }
    return [];
  }

  private validateTargetSelection(card: CardDefinition, targetHex?: HexPos): string | null {
    if (!this.cardNeedsBoardTarget(card)) return null;
    if (!targetHex) return 'needs a board target';
    const validTargets = this.getValidTargets(card);
    if (!validTargets.some((h) => sameHex(h, targetHex))) return 'cannot target that hex';
    if (card.target === 'enemy' && !this.enemies.some((e) => e.hp > 0 && sameHex(targetHex, e.position))) {
      return 'needs a target entity on that hex';
    }
    return null;
  }

  private cardNeedsBoardTarget(card: CardDefinition): boolean {
    return card.target === 'enemy' || card.target === 'aoe' || card.effects.some((e) => e.type === 'moveSelf');
  }

  private resolvePrimaryTarget(card: CardDefinition, targetHex?: HexPos): FighterState | undefined {
    if (card.target === 'enemy' && targetHex) {
      return this.enemies.find((e) => e.hp > 0 && sameHex(targetHex, e.position));
    }
    return undefined;
  }

  private movePlayerTo(destination: HexPos, logPrefix: string): void {
    this.player.position = { ...destination };
    this.pushLog(`${logPrefix} :: moved to ${this.formatPos(this.player.position)}.`);
    this.applyPlayerFieldEntryEffects();
  }

  // ── Card playability ───────────────────────────────────────────────────────

  private evaluateCardPlayability(card: CardDefinition): CardPlayability {
    if (this.player.hp <= 0 || this.enemies.every((e) => e.hp <= 0)) {
      return { canPlay: false, reason: 'combat is over' };
    }

    const isHighBit = this.isPlayerOnField('0x80');
    let actualCost = isHighBit ? card.cost * 2 : card.cost;
    if (this.firstCardThisRound && this.hasRelic('branch_predictor')) actualCost = Math.max(0, actualCost - 1);

    if (actualCost > this.player.cpu) {
      return {
        canPlay: false,
        reason: isHighBit
          ? `needs ${actualCost} CPU (HIGH BIT doubles cost)`
          : `needs ${card.cost} CPU`,
      };
    }
    if (card.effects.some((e) => e.type === 'moveSelf') && this.hasStatus(this.player, 'root')) {
      return { canPlay: false, reason: 'is blocked by root' };
    }
    if (card.target === 'enemy') {
      const range = card.range ?? { min: 1, max: 1 };
      const anyInRange = this.enemies.some((e) => {
        if (e.hp <= 0) return false;
        const dist = this.grid.distance(this.player.position, e.position);
        return dist >= range.min && dist <= range.max;
      });
      if (!anyInRange) return { canPlay: false, reason: `out of range (${range.min}-${range.max})` };
    }
    return { canPlay: true, reason: null };
  }

  // ── Conditions ─────────────────────────────────────────────────────────────

  private evaluateCondition(cond: CardCondition): boolean {
    switch (cond.kind) {
      case 'enemyCpuZero':           return this.enemy.cpu === 0;
      case 'enemyCpuAboveZero':      return this.enemy.cpu > 0;
      case 'playerHpLessThanEnemy':  return this.player.hp < this.enemy.hp;
      case 'playerHpMoreThanEnemy':  return this.player.hp > this.enemy.hp;
      case 'playerHpBelow':          return this.player.hp < (cond.value ?? 10);
      case 'stackAtLeast':           return this.player.stackCount >= (cond.value ?? 4);
      case 'enemyHasStatus':         return this.enemy.statuses.length > 0;
      default:                       return false;
    }
  }

  // ── Intent computation ─────────────────────────────────────────────────────

  private computeEnemyIntent(): string {
    const distance = this.grid.distance(this.enemy.position, this.player.position);
    const p2 = this.isPhaseTwo(this.enemy);
    const p2tag = p2 ? ' [PHASE 2]' : '';

    if (this.enemySkipTurns > 0) return 'INTERRUPTED :: skip next turn';

    switch (this.currentEnemyTemplate.behavior) {
      case 'collector': return this.computeCollectorIntent(p2);
      case 'panicker':  return this.computePanickerIntent(p2);
      case 'scheduler': {
        const interval = p2 ? 3 : 5;
        const dmg = p2 ? 14 : 9;
        if (this.hasStatus(this.enemy, 'root') && distance > 1) return `ROOTED :: cannot reposition${p2tag}`;
        if (this.round % interval === 0 && this.enemy.cpu >= 3) return `SCHEDULED_TASK :: ${dmg} damage${p2tag}`;
        if (distance > 1) return 'REPOSITION :: move closer';
        if (this.enemy.cpu >= 2) return `HOURLY :: ${p2 ? 9 : 6} damage${p2tag}`;
        return `BUFFER :: gain ${p2 ? 3 : 2} armor`;
      }
      case 'sentinel': {
        if (!this.hasStatus(this.player, 'vulnerable') && distance <= 3 && this.enemy.cpu >= 2) return `SCAN :: apply vulnerable${p2tag}`;
        if (distance <= 2 && this.enemy.cpu >= 3) return `QUARANTINE :: ${p2 ? '7' : '4'} dmg + root${p2 ? ' + shieldBreak' : ''}`;
        if (this.hasStatus(this.enemy, 'root') && distance > 2) return 'ROOTED :: advance denied';
        if (distance > 2) return 'ADVANCE :: close distance';
        return `BARRIER :: gain ${p2 ? 5 : 3} armor`;
      }
      default: return 'IDLE';
    }
  }

  private computeCollectorIntent(p2: boolean): string {
    const distance = this.grid.distance(this.enemy.position, this.player.position);
    if (this.player.stackCount > 0 && distance <= 2) return `GC_SWEEP :: ${5 + this.player.stackCount} dmg + clear stack${p2 ? ' + discard' : ''}`;
    if (distance > 2) return 'SCAN :: moving closer';
    return `CORRUPT :: burn ${p2 ? 3 : 2}`;
  }

  private computePanickerIntent(p2: boolean): string {
    const mul = p2 ? 3 : 2;
    const dmg = Math.min(this.round * mul, p2 ? 30 : 20);
    return `ESCALATE :: ${dmg} damage${p2 ? ' + burn 2 [BERSERK]' : ''}`;
  }

  private computeEnemyIntents(): string[] {
    const intents: string[] = [];
    if (this.enemy.hp > 0) intents.push(this.computeEnemyIntent());
    for (const minion of this.enemies.slice(1).filter((e) => e.hp > 0)) {
      const dist = this.grid.distance(minion.position, this.player.position);
      const p2 = this.isPhaseTwo(minion);
      if (this.enemySkipTurns > 0) intents.push('HALTED :: skip cycle');
      else if (dist > 1) intents.push('SPREAD :: closing distance');
      else if (minion.cpu >= 2) intents.push(`LEAK :: ${p2 ? 7 : 4} damage`);
      else intents.push('STALL :: insufficient CPU');
    }
    return intents;
  }

  // ── Movement ───────────────────────────────────────────────────────────────

  private tryMoveTowardPlayer(): boolean {
    if (this.hasStatus(this.enemy, 'root')) {
      this.pushLog(`${this.enemy.name} is rooted :: reposition blocked.`);
      return false;
    }
    const otherBlockers = this.enemies.slice(1).filter((e) => e.hp > 0).map((e) => e.position);
    this.enemy.position = this.grid.stepToward(this.enemy.position, this.player.position, [this.player.position, ...otherBlockers]);
    this.applyEnemyFieldEntryEffects(this.enemy);
    return true;
  }

  // ── Creation helpers ───────────────────────────────────────────────────────

  private createPlayer(): FighterState {
    const cpuBonus = this.hasRelic('overclock_chip') ? 2 : 0;
    return {
      ...BASE_PLAYER,
      cpuMax: BASE_PLAYER.cpuMax + cpuBonus,
      cpu: BASE_PLAYER.cpu + cpuBonus,
      position: { ...this.playerStart },
      statuses: [],
      stackCount: 0,
    };
  }

  private createEnemy(template: EnemyTemplate): FighterState {
    return {
      id: template.id,
      name: template.name,
      archetype: template.archetype,
      hp: template.hp,
      maxHp: template.hp,
      armor: 0,
      cpu: template.cpu,
      cpuMax: template.cpu,
      position: { ...(this.enemyStartOverride ?? template.position) },
      statuses: [],
      stackCount: 0,
    };
  }

  private createEnemyFixed(template: EnemyTemplate): FighterState {
    return {
      id: template.id,
      name: template.name,
      archetype: template.archetype,
      hp: template.hp,
      maxHp: template.hp,
      armor: 0,
      cpu: template.cpu,
      cpuMax: template.cpu,
      position: { ...template.position },
      statuses: [],
      stackCount: 0,
    };
  }

  private cloneFighter(fighter: FighterState): FighterState {
    return {
      ...fighter,
      position: { ...fighter.position },
      statuses: fighter.statuses.map((s) => ({ ...s })),
    };
  }

  private createBlankStats(): RunStats {
    return { totalDamageDealt: 0, totalDamageTaken: 0, totalCardsPlayed: 0, totalRoundsSurvived: 0, enemiesDefeated: 0, highestSingleHit: 0 };
  }

  // ── Relic helpers ──────────────────────────────────────────────────────────

  private hasRelic(id: RelicId): boolean {
    return this.relics.some((r) => r.id === id);
  }

  // ── Status helpers ─────────────────────────────────────────────────────────

  private hasStatus(target: FighterState, kind: StatusKind): boolean {
    return this.statusValue(target, kind) > 0;
  }

  private statusValue(target: FighterState, kind: StatusKind): number {
    return target.statuses.find((s) => s.kind === kind)?.value ?? 0;
  }

  // ── Utility ────────────────────────────────────────────────────────────────

  private findEnemyIndex(encounterId?: string): number {
    if (!encounterId) return this.enemyIndex;
    const idx = ENEMIES.findIndex((e) => e.id === encounterId);
    return idx === -1 ? 0 : idx;
  }

  private pushLog(entry: string): void {
    this.log.unshift(entry);
    if (this.log.length > 14) this.log.pop();
  }

  private formatPos(pos: HexPos): string {
    return `${pos.q},${pos.r}`;
  }
}

// ── Exported helpers ──────────────────────────────────────────────────────────

function formatStatus(kind: StatusKind, value: number, duration: number): string {
  return `${formatStatusLabel(kind)} ×${value} for ${duration} turn${duration === 1 ? '' : 's'}`;
}

function formatStatusLabel(kind: StatusKind): string {
  const labels: Record<StatusKind, string> = { burn: 'burn', shieldBreak: 'shield break', root: 'root', vulnerable: 'vulnerable', regen: 'regen' };
  return labels[kind] ?? kind;
}

export { formatStatusLabel };

export function cardById(cardId: string): CardDefinition {
  const card = CARD_LIBRARY.find((c) => c.id === cardId);
  if (!card) throw new Error(`Unknown card: ${cardId}`);
  return card;
}
