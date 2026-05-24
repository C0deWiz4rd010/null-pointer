export type CardEffectType =
  | 'damage'
  | 'heal'
  | 'selfDamage'
  | 'gainCpu'
  | 'moveSelf'
  | 'draw'
  | 'armor'
  | 'enemyCpuLoss'
  | 'enemyArmorBreak'
  | 'skipEnemyTurn'
  | 'applyStatus'
  | 'push'
  | 'pull'
  | 'cleanse'
  | 'regen'
  | 'onNextPlayDamage'
  | 'stackPush'
  | 'stackPop'
  | 'damagePerStack';

/** 'aoe' fires against all entities within range.max hexes of the anchor hex. */
export type CardTarget = 'enemy' | 'self' | 'none' | 'aoe';

export type StatusKind = 'burn' | 'shieldBreak' | 'root' | 'vulnerable' | 'regen';

export type FieldAddress = '0xFF' | '0x00' | '0x80' | '0x7F' | '0x0D' | '0x0A';

export type CardRarity = 'common' | 'uncommon' | 'rare';

// ── Conditional effects ──────────────────────────────────────────────────────

export type CardConditionKind =
  | 'enemyCpuZero'           // enemy has 0 CPU
  | 'enemyCpuAboveZero'      // enemy has > 0 CPU
  | 'playerHpLessThanEnemy'  // player HP < enemy HP
  | 'playerHpMoreThanEnemy'  // player HP > enemy HP
  | 'playerHpBelow'          // player HP < condition.value (absolute)
  | 'stackAtLeast'           // player stackCount >= condition.value
  | 'enemyHasStatus';        // enemy has at least one active status effect

export interface CardCondition {
  kind: CardConditionKind;
  /** Threshold used by playerHpBelow and stackAtLeast. */
  value?: number;
}

// ── Core data types ──────────────────────────────────────────────────────────

export interface CardRange {
  min: number;
  max: number;
}

export interface StatusInstance {
  kind: StatusKind;
  value: number;
  duration: number;
}

export interface CardEffect {
  type: CardEffectType;
  value: number;
  duration?: number;
  status?: StatusKind;
  target?: Exclude<CardTarget, 'none'>;
  /** If present, the effect fires only when this condition holds at resolution time. */
  condition?: CardCondition;
}

export interface CardDefinition {
  id: string;
  name: string;
  ascii: string;
  cost: number;
  rarity?: CardRarity;
  description: string;
  tags: string[];
  target: CardTarget;
  range?: CardRange;
  effects: CardEffect[];
}
