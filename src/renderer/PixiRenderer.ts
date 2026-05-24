import { Application, Container, Graphics, Text } from 'pixi.js';
import type { CombatSnapshot, DamageEvent } from '../game/combat/CombatSystem';
import { sameHex, type HexPos } from '../game/grid/HexGrid';

interface FloatingTextEntry {
  text: Text;
  baseY: number;
  startTime: number;
}

export class PixiRenderer {
  private readonly app = new Application({
    antialias: true,
    backgroundAlpha: 0,
  });

  private readonly layer = new Container();

  private readonly entities = new Container();

  private readonly floatingLayer = new Container();

  private centerX = 0;

  private centerY = 0;

  private hexRadius = 0;

  private hexClickCallback: ((pos: HexPos) => void) | null = null;

  private floatingTexts: FloatingTextEntry[] = [];

  async attach(host: HTMLElement): Promise<void> {
    this.app.renderer.resize(host.clientWidth || 900, host.clientHeight || 560);
    const canvas = this.app.view as HTMLCanvasElement;
    if (canvas.parentElement !== host) {
      host.prepend(canvas);
    }
    this.app.stage.addChild(this.layer);
    this.app.stage.addChild(this.entities);
    this.app.stage.addChild(this.floatingLayer);

    // Animate floating damage numbers
    this.app.ticker.add(() => {
      const now = Date.now();
      const DURATION = 1100;
      for (const ft of this.floatingTexts) {
        const age = now - ft.startTime;
        const t = age / DURATION;
        ft.text.alpha = Math.max(0, 1 - t * t);
        ft.text.y = ft.baseY - t * 38;
        ft.text.scale.set(1 + t * 0.25);
      }
      this.floatingTexts = this.floatingTexts.filter((ft) => {
        const alive = Date.now() - ft.startTime < DURATION;
        if (!alive) this.floatingLayer.removeChild(ft.text);
        return alive;
      });
    });

    canvas.addEventListener('click', (e) => {
      if (!this.hexClickCallback) return;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const hex = this.screenToHex(sx, sy);
      if (hex) this.hexClickCallback(hex);
    });
  }

  onHexClick(callback: ((pos: HexPos) => void) | null): void {
    this.hexClickCallback = callback;
  }

  /** Add a floating damage/heal number anchored to a hex position. */
  addFloatingText(pos: HexPos, amount: number, kind: DamageEvent['kind']): void {
    if (this.hexRadius === 0) return;
    const point = axialToPixel(pos, this.centerX, this.centerY, this.hexRadius);

    let color: number;
    let prefix: string;
    if (kind === 'heal') { color = 0x00ff88; prefix = '+'; }
    else if (kind === 'self') { color = 0xff9900; prefix = '-'; }
    else { color = 0xff4d5c; prefix = '-'; }

    const label = new Text(`${prefix}${amount}`, {
      fontFamily: 'VT323',
      fontSize: 32,
      fill: color,
      dropShadow: true,
      dropShadowColor: 0x000000,
      dropShadowDistance: 3,
      dropShadowAlpha: 0.8,
    });
    label.anchor.set(0.5);
    const baseY = point.y - 24;
    label.position.set(point.x + (Math.random() - 0.5) * 20, baseY);
    this.floatingLayer.addChild(label);
    this.floatingTexts.push({ text: label, baseY, startTime: Date.now() });
  }

  render(snapshot: CombatSnapshot, validTargetHexes: HexPos[] = []): void {
    const width = this.app.renderer.width;
    const height = this.app.renderer.height;
    this.centerX = width / 2;
    this.centerY = height / 2 + 10;
    this.hexRadius = Math.min(width, height) / 9;

    const { centerX, centerY } = this;
    const radius = this.hexRadius;

    this.layer.removeChildren();
    this.entities.removeChildren();

    const selectedCard = snapshot.selectedCardId
      ? snapshot.hand.find((c) => c.id === snapshot.selectedCardId) ?? null
      : null;
    const isAoeMode = selectedCard?.target === 'aoe';
    const aoeRange = isAoeMode ? (selectedCard!.range ?? { min: 0, max: 2 }) : null;

    for (const cell of snapshot.grid.cells) {
      const point = axialToPixel(cell, centerX, centerY, radius);
      const isEnemyCell = snapshot.enemies.some((en) => en.hp > 0 && sameHex(cell, en.position));
      const isValidTarget = validTargetHexes.some((h) => sameHex(h, cell));
      const isPlayerCell = sameHex(cell, snapshot.player.position);
      const fieldCell = snapshot.fieldCells.find((fc) => sameHex(fc.pos, cell));

      const isAoeEnemyTarget = isAoeMode && isEnemyCell && aoeRange !== null
        ? validTargetHexes.some((anchor) => {
            const dist = snapshot.grid.distance(anchor, cell);
            return dist >= aoeRange!.min && dist <= aoeRange!.max;
          })
        : false;

      // Background fill per cell type
      let bgColor = 0x0a1622;
      if (isAoeEnemyTarget) bgColor = 0x3a0a2b;
      else if (isEnemyCell) bgColor = 0x2a0818;
      else if (isPlayerCell) bgColor = 0x062214;
      else if (fieldCell) bgColor = fieldBgColor(fieldCell.address);

      let borderColor = 0x1affd5;
      let borderAlpha = 0.18;
      let borderWidth = 1.5;
      if (isValidTarget) { borderColor = 0xffff00; borderAlpha = 0.9; borderWidth = 3; }
      else if (isAoeEnemyTarget) { borderColor = 0xff00ff; borderAlpha = 0.8; borderWidth = 3; }
      else if (isPlayerCell) { borderColor = 0x00ff88; borderAlpha = 0.5; borderWidth = 2; }
      else if (isEnemyCell) { borderColor = 0xff4466; borderAlpha = 0.5; borderWidth = 2; }
      else if (fieldCell) { borderColor = fieldBorderColor(fieldCell.address); borderAlpha = 0.55; borderWidth = 2; }

      const tile = new Graphics()
        .lineStyle(borderWidth, borderColor, borderAlpha)
        .beginFill(bgColor, 0.95)
        .drawPolygon(hexPoints(point, radius))
        .endFill();
      this.layer.addChild(tile);

      // Cell label
      const cellLabel = fieldCell ? fieldCell.address : formatCell(cell);
      const labelColor = fieldCell ? fieldAddressColor(fieldCell.address) : 0x4ab8a0;
      const label = new Text(cellLabel, {
        fontFamily: 'Fira Code',
        fontSize: fieldCell ? 10 : 12,
        fill: labelColor,
      });
      label.anchor.set(0.5);
      label.position.set(point.x, point.y);
      this.layer.addChild(label);

      if (isAoeEnemyTarget) {
        const hint = new Text('IN BLAST', { fontFamily: 'Fira Code', fontSize: 8, fill: 0xff00ff });
        hint.anchor.set(0.5);
        hint.position.set(point.x, point.y + 16);
        this.layer.addChild(hint);
      } else if (isValidTarget && fieldCell) {
        const hint = new Text('TARGET', { fontFamily: 'Fira Code', fontSize: 8, fill: 0xffff00 });
        hint.anchor.set(0.5);
        hint.position.set(point.x, point.y + 16);
        this.layer.addChild(hint);
      }
    }

    // Render player entity
    this.entities.addChild(
      makeEntity(snapshot.player.position, centerX, centerY, radius, 0x00ff88, '◈', {
        hp: snapshot.player.hp,
        maxHp: snapshot.player.maxHp,
        armor: snapshot.player.armor,
        isPlayer: true,
      }),
    );

    // Render enemies
    for (const en of snapshot.enemies) {
      if (en.hp <= 0) continue;
      const glyph = enemyGlyph(en.archetype);
      const color = en.phaseTwo ? 0xff2244 : 0xff00ff;
      this.entities.addChild(
        makeEntity(en.position, centerX, centerY, radius, color, glyph, {
          hp: en.hp,
          maxHp: en.maxHp,
          armor: en.armor,
          isPlayer: false,
          phaseTwo: en.phaseTwo,
        }),
      );
    }
  }

  /** Convert screen coords → nearest grid hex. */
  private screenToHex(sx: number, sy: number): HexPos | null {
    if (this.hexRadius === 0) return null;
    const r = this.hexRadius;
    const relY = sy - this.centerY;
    const rCoord = relY / (r * 1.5);
    const relX = sx - this.centerX;
    const qCoord = relX / (r * Math.sqrt(3)) - rCoord / 2;

    const s = -qCoord - rCoord;
    let rq = Math.round(qCoord);
    let rr = Math.round(rCoord);
    const rs = Math.round(s);

    const qDiff = Math.abs(rq - qCoord);
    const rDiff = Math.abs(rr - rCoord);
    const sDiff = Math.abs(rs - s);

    if (qDiff > rDiff && qDiff > sDiff) rq = -rr - rs;
    else if (rDiff > sDiff) rr = -rq - rs;

    const candidate = { q: rq, r: rr };
    const point = axialToPixel(candidate, this.centerX, this.centerY, r);
    const dx = sx - point.x;
    const dy = sy - point.y;
    return Math.sqrt(dx * dx + dy * dy) < r * 0.9 ? candidate : null;
  }
}

// ── Entity rendering ──────────────────────────────────────────────────────────

interface EntityOptions {
  hp: number;
  maxHp: number;
  armor: number;
  isPlayer: boolean;
  phaseTwo?: boolean;
}

function makeEntity(
  pos: HexPos,
  centerX: number,
  centerY: number,
  radius: number,
  color: number,
  glyph: string,
  opts: EntityOptions,
): Container {
  const point = axialToPixel(pos, centerX, centerY, radius);
  const container = new Container();

  // Glow
  const glow = new Graphics().beginFill(color, opts.phaseTwo ? 0.35 : 0.18).drawCircle(0, 0, radius * 0.58).endFill();

  // Body circle
  const body = new Graphics().beginFill(color, 0.9).drawCircle(0, 0, radius * 0.32).endFill();

  // Glyph icon
  const icon = new Text(glyph, {
    fontFamily: 'Fira Code',
    fontSize: 18,
    fill: 0x050f15,
  });
  icon.anchor.set(0.5);

  // HP bar (below entity)
  const barWidth = radius * 1.1;
  const barHeight = 5;
  const barY = radius * 0.52;
  const hpFraction = Math.max(0, opts.hp / opts.maxHp);

  const barBg = new Graphics()
    .beginFill(0x0a1a10, 0.8)
    .drawRect(-barWidth / 2, barY, barWidth, barHeight)
    .endFill();

  const hpColor = hpFraction > 0.5 ? 0x00ff88 : hpFraction > 0.25 ? 0xffaa00 : 0xff3344;
  const barFill = new Graphics()
    .beginFill(hpColor, 0.9)
    .drawRect(-barWidth / 2, barY, barWidth * hpFraction, barHeight)
    .endFill();

  container.addChild(glow, barBg, barFill, body, icon);

  // Armor indicator
  if (opts.armor > 0) {
    const armorText = new Text(`🛡${opts.armor}`, {
      fontFamily: 'Fira Code',
      fontSize: 10,
      fill: 0x88ccff,
    });
    armorText.anchor.set(0.5);
    armorText.position.set(radius * 0.5, -radius * 0.45);
    container.addChild(armorText);
  }

  // Phase 2 indicator
  if (opts.phaseTwo) {
    const p2 = new Text('!!', {
      fontFamily: 'VT323',
      fontSize: 16,
      fill: 0xff2244,
    });
    p2.anchor.set(0.5);
    p2.position.set(-radius * 0.5, -radius * 0.45);
    container.addChild(p2);
  }

  container.position.set(point.x, point.y);
  return container;
}

// ── Coordinate helpers ────────────────────────────────────────────────────────

function axialToPixel(pos: HexPos, centerX: number, centerY: number, radius: number): { x: number; y: number } {
  const x = centerX + radius * Math.sqrt(3) * (pos.q + pos.r / 2);
  const y = centerY + radius * 1.5 * pos.r;
  return { x, y };
}

function hexPoints(center: { x: number; y: number }, radius: number): number[] {
  const pts: number[] = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    pts.push(center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle));
  }
  return pts;
}

function formatCell(pos: HexPos): string {
  const q = (pos.q + 2).toString(16).toUpperCase();
  const r = (pos.r + 2).toString(16).toUpperCase();
  return `${q},${r}`;
}

function enemyGlyph(archetype: string): string {
  if (archetype.includes('scheduler')) return '⏰';
  if (archetype.includes('sentinel')) return '🔒';
  if (archetype.includes('garbage')) return '🗑';
  if (archetype.includes('fault')) return '💥';
  if (archetype.includes('orphaned')) return '👻';
  return '⚙';
}

function fieldBgColor(addr: string): number {
  switch (addr) {
    case '0x0D': return 0x071e2e;
    case '0x0A': return 0x071e12;
    case '0x80': return 0x1c1a06;
    case '0x00': return 0x0a0a0a;
    case '0xFF': return 0x1c0606;
    case '0x7F': return 0x14080a;
    default: return 0x0a1622;
  }
}

function fieldBorderColor(addr: string): number {
  switch (addr) {
    case '0x0D': return 0x00d4ff;
    case '0x0A': return 0x00ff88;
    case '0x80': return 0xffd700;
    case '0x00': return 0x888888;
    case '0xFF': return 0xff4422;
    case '0x7F': return 0xcc00aa;
    default: return 0x1affd5;
  }
}

function fieldAddressColor(address: string): number {
  switch (address) {
    case '0x0D': return 0x00d4ff;
    case '0x0A': return 0x00ff88;
    case '0x80': return 0xffd700;
    case '0x00': return 0x888888;
    case '0xFF': return 0xff4422;
    case '0x7F': return 0xcc00aa;
    default: return 0xaaaaaa;
  }
}

export function positionsOverlap(left: HexPos, right: HexPos): boolean {
  return sameHex(left, right);
}
