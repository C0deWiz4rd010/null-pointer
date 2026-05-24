import { CombatSystem } from '../game/combat/CombatSystem';
import type { DraftItem, RunStats, CombatSnapshot } from '../game/combat/CombatSystem';
import { PixiRenderer } from '../renderer/PixiRenderer';
import { soundSystem } from '../audio/SoundSystem';

type AppState = 'combat' | 'draft' | 'gameover' | 'victory' | 'deckviewer';

export class NullPointerApp {
  private readonly combat = new CombatSystem();

  private readonly renderer = new PixiRenderer();

  private readonly boardHost = document.createElement('div');

  private readonly shell = document.createElement('div');

  private readonly outcomeOverlay = document.createElement('div');

  private readonly deckViewerOverlay = document.createElement('div');

  private appState: AppState = 'combat';

  private draftItems: DraftItem[] = [];

  private prevOutcome: 'ongoing' | 'victory' | 'defeat' = 'ongoing';

  constructor(private readonly root: HTMLElement) {
    this.boardHost.className = 'board-shell panel';
    this.shell.className = 'shell';
    this.outcomeOverlay.className = 'outcome-overlay hidden';
    this.deckViewerOverlay.className = 'deck-viewer-overlay hidden';
  }

  async mount(): Promise<void> {
    soundSystem.init();
    this.root.replaceChildren(this.shell);
    this.shell.appendChild(this.buildLayout());
    this.shell.appendChild(this.outcomeOverlay);
    this.shell.appendChild(this.deckViewerOverlay);
    await this.renderer.attach(this.boardHost);

    this.renderer.onHexClick((hex) => {
      const snap = this.combat.snapshot();
      if (!snap.selectedCardId) return;

      const isValid = snap.validTargetHexes.some((h) => h.q === hex.q && h.r === hex.r);
      if (!isValid) {
        this.combat.selectCard(snap.selectedCardId);
        this.render();
        return;
      }
      this.combat.playCard(snap.selectedCardId, hex);
      soundSystem.playHit();
      this.flushDamageEvents();
      this.render();
    });

    // ── Keyboard shortcuts ────────────────────────────────────────────────────
    document.addEventListener('keydown', (e) => {
      // Escape: cancel selection or close deck viewer
      if (e.key === 'Escape') {
        if (this.appState === 'deckviewer') {
          this.appState = 'combat';
          this.renderDeckViewer();
          return;
        }
        if (this.appState === 'combat') {
          const snapEsc = this.combat.snapshot();
          if (snapEsc.selectedCardId) {
            this.combat.selectCard(snapEsc.selectedCardId);
            this.render();
          }
        }
        return;
      }

      // D: toggle deck viewer
      if (e.key === 'd' || e.key === 'D') {
        const newState: AppState = this.appState === 'deckviewer' ? 'combat' : 'deckviewer';
        this.appState = newState;
        this.renderDeckViewer();
        return;
      }

      // Only handle remaining shortcuts in active combat
      if (this.appState !== 'combat') return;
      const snap = this.combat.snapshot();

      if (e.key === 'e' || e.key === 'E') {
        if (snap.canEndTurn) {
          this.combat.endTurn();
          soundSystem.playEndTurn();
          this.flushDamageEvents();
          this.render();
        }
        return;
      }

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 5) {
        const card = snap.hand[num - 1];
        if (!card) return;
        const playability = snap.playability[card.id];
        if (!playability?.canPlay) { soundSystem.playError(); return; }

        const needsTarget = card.target === 'enemy'
          || card.target === 'aoe'
          || (card.target === 'self' && card.effects.some((ef) => ef.type === 'moveSelf'));

        if (needsTarget) {
          this.combat.selectCard(card.id);
        } else {
          this.combat.playCard(card.id);
          soundSystem.playCardPlay();
          this.flushDamageEvents();
        }
        this.render();
      }
    });

    this.render();
  }

  private flushDamageEvents(): void {
    for (const ev of this.combat.takeDamageEvents()) {
      this.renderer.addFloatingText(ev.pos, ev.amount, ev.kind);
      if (ev.kind === 'heal') soundSystem.playHeal();
    }
  }

  private buildLayout(): HTMLElement {
    const layout = document.createElement('div');
    layout.className = 'layout';
    layout.append(this.buildHud(), this.buildBattleColumn());
    return layout;
  }

  private buildHud(): HTMLElement {
    const hud = document.createElement('aside');
    hud.className = 'hud panel';
    hud.dataset.role = 'hud';
    return hud;
  }

  private buildBattleColumn(): HTMLElement {
    const column = document.createElement('section');
    column.className = 'battle-column';

    const overlayTop = document.createElement('div');
    overlayTop.className = 'overlay-top';
    this.boardHost.appendChild(overlayTop);

    const handPanel = document.createElement('div');
    handPanel.className = 'hand-panel panel';
    handPanel.dataset.role = 'hand';

    column.append(this.boardHost, handPanel);
    return column;
  }

  private render(): void {
    const snap = this.combat.snapshot();

    // Detect outcome transitions
    if (this.appState === 'combat') {
      if (snap.combatOutcome === 'victory' && this.prevOutcome !== 'victory') {
        soundSystem.playVictory();
        if (snap.encounterNumber >= snap.maxEncounters) {
          this.appState = 'victory';
        } else {
          this.draftItems = this.combat.getDraftItems();
          this.appState = 'draft';
        }
      } else if (snap.combatOutcome === 'defeat' && this.prevOutcome !== 'defeat') {
        soundSystem.playDefeat();
        this.appState = 'gameover';
      }
    }
    this.prevOutcome = snap.combatOutcome;

    const hud = this.shell.querySelector<HTMLElement>('[data-role="hud"]');
    const hand = this.shell.querySelector<HTMLElement>('[data-role="hand"]');
    const overlay = this.shell.querySelector<HTMLElement>('.overlay-top');

    if (!hud || !hand || !overlay) throw new Error('UI container missing');

    hud.replaceChildren(
      this.renderBoot(snap),
      this.renderStats(snap),
      this.renderRelics(snap),
      this.renderTelemetry(snap),
      this.renderLog(snap.log),
    );

    overlay.replaceChildren(
      this.renderRoundBox(snap),
      ...snap.enemyIntents.map((intent, i) => this.renderIntent(intent, snap.enemies[i]?.name, snap.enemies[i]?.phaseTwo)),
    );

    hand.replaceChildren(this.renderHand(snap));
    this.renderer.render(snap, snap.validTargetHexes);
    this.renderOutcomeOverlay(snap);
  }

  private renderOutcomeOverlay(snap: CombatSnapshot): void {
    const ov = this.outcomeOverlay;

    if (this.appState === 'draft') {
      ov.className = 'outcome-overlay';
      ov.replaceChildren(this.buildDraftScreen(snap));
      return;
    }
    if (this.appState === 'gameover') {
      ov.className = 'outcome-overlay';
      ov.replaceChildren(this.buildGameOverScreen(snap.runStats, snap.encounterNumber, snap.maxEncounters));
      return;
    }
    if (this.appState === 'victory') {
      ov.className = 'outcome-overlay';
      ov.replaceChildren(this.buildVictoryScreen(snap.runStats));
      return;
    }
    ov.className = 'outcome-overlay hidden';
    ov.replaceChildren();
  }

  private renderDeckViewer(): void {
    const ov = this.deckViewerOverlay;
    if (this.appState === 'deckviewer') {
      ov.className = 'deck-viewer-overlay';
      const snap = this.combat.snapshot();
      ov.replaceChildren(this.buildDeckViewerScreen(snap));
    } else {
      ov.className = 'deck-viewer-overlay hidden';
      ov.replaceChildren();
    }
  }

  // ── Draft Screen ───────────────────────────────────────────────────────────

  private buildDraftScreen(snap: CombatSnapshot): HTMLElement {
    const screen = document.createElement('div');
    screen.className = 'outcome-screen draft-screen';

    const nextEnc = snap.encounterNumber + 1;
    const hasRelic = this.draftItems.some((i) => i.kind === 'relic');

    const header = document.createElement('header');
    header.innerHTML = `
      <div class="outcome-tag">MODULE PURGED · ENCOUNTER ${snap.encounterNumber}/${snap.maxEncounters}</div>
      <h2 class="outcome-title">SELECT REWARD</h2>
      <p class="outcome-subtitle">${hasRelic ? 'Choose a card or install a relic. ' : 'Install a new opcode. '}Next: Encounter ${nextEnc}.</p>
    `;

    const grid = document.createElement('div');
    grid.className = 'draft-grid';

    for (const item of this.draftItems) {
      if (item.kind === 'card') {
        const btn = this.buildDraftCardButton(item.card, () => {
          this.combat.addCardToDeck(item.card);
          this.advanceFromDraft();
        });
        grid.appendChild(btn);
      } else {
        const btn = this.buildDraftRelicButton(item.relic, () => {
          this.combat.addRelic(item.relic);
          soundSystem.playRelicPick();
          this.advanceFromDraft();
        });
        grid.appendChild(btn);
      }
    }

    const skipBtn = document.createElement('button');
    skipBtn.className = 'action-button draft-skip';
    skipBtn.textContent = 'SKIP — forfeit reward';
    skipBtn.addEventListener('click', () => this.advanceFromDraft());

    screen.append(header, grid, skipBtn);
    return screen;
  }

  private buildDraftCardButton(card: import('../game/cards/types').CardDefinition, onClick: () => void): HTMLElement {
    const btn = document.createElement('button');
    btn.className = `draft-card rarity-${card.rarity ?? 'common'}`;
    btn.innerHTML = `
      <div class="draft-item-tag">${card.rarity?.toUpperCase() ?? 'COMMON'}</div>
      <div class="card-header">
        <div>
          <div class="card-id">${card.id}</div>
          <h3 class="card-name">${card.name}</h3>
        </div>
        <div class="card-cost">CPU ${card.cost}</div>
      </div>
      <div class="card-ascii">${card.ascii}</div>
      <div class="draft-desc">${card.description}</div>
      <div class="card-tags">${card.tags.map((t) => `<span class="chip">${t}</span>`).join('')}</div>
    `;
    btn.addEventListener('click', () => { soundSystem.playCardPlay(); onClick(); });
    return btn;
  }

  private buildDraftRelicButton(relic: import('../game/combat/CombatSystem').Relic, onClick: () => void): HTMLElement {
    const btn = document.createElement('button');
    btn.className = 'draft-card relic-card';
    btn.innerHTML = `
      <div class="draft-item-tag relic-tag">RELIC</div>
      <div class="relic-ascii">${relic.ascii}</div>
      <h3 class="card-name relic-name">${relic.name}</h3>
      <div class="draft-desc">${relic.description}</div>
    `;
    btn.addEventListener('click', onClick);
    return btn;
  }

  private advanceFromDraft(): void {
    this.prevOutcome = 'ongoing';
    this.combat.advanceEncounter();
    this.appState = 'combat';
    this.render();
  }

  // ── Game Over Screen ───────────────────────────────────────────────────────

  private buildGameOverScreen(stats: RunStats, encNum: number, maxEnc: number): HTMLElement {
    const screen = document.createElement('div');
    screen.className = 'outcome-screen gameover-screen';

    const addr = `0x${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}`;
    const cleared = Math.max(0, encNum - 1);

    screen.innerHTML = `
      <div class="outcome-tag danger">KERNEL PANIC</div>
      <h2 class="outcome-title">Segment_0x00 :: TERMINATED</h2>
      <pre class="bsod-art">*** STOP: 0x0000007B
  INACCESSIBLE_BOOT_DEVICE
  Segment_0x00 has been garbage collected.
  Memory freed: ${addr}</pre>
      <div class="run-stats">
        <div class="run-stat"><span class="label">ENCOUNTERS</span><span class="stat-value">${cleared}/${maxEnc} cleared</span></div>
        <div class="run-stat"><span class="label">DAMAGE DEALT</span><span class="stat-value">${stats.totalDamageDealt}</span></div>
        <div class="run-stat"><span class="label">DAMAGE TAKEN</span><span class="stat-value">${stats.totalDamageTaken}</span></div>
        <div class="run-stat"><span class="label">CARDS PLAYED</span><span class="stat-value">${stats.totalCardsPlayed}</span></div>
        <div class="run-stat"><span class="label">ROUNDS</span><span class="stat-value">${stats.totalRoundsSurvived}</span></div>
        <div class="run-stat"><span class="label">BEST HIT</span><span class="stat-value">${stats.highestSingleHit} dmg</span></div>
      </div>
    `;

    const reboot = document.createElement('button');
    reboot.className = 'action-button primary outcome-reboot';
    reboot.textContent = 'REBOOT :: start new run';
    reboot.addEventListener('click', () => {
      this.combat.fullReset();
      this.prevOutcome = 'ongoing';
      this.appState = 'combat';
      this.render();
    });
    screen.appendChild(reboot);
    return screen;
  }

  // ── Victory Screen ─────────────────────────────────────────────────────────

  private buildVictoryScreen(stats: RunStats): HTMLElement {
    const screen = document.createElement('div');
    screen.className = 'outcome-screen victory-screen';

    screen.innerHTML = `
      <div class="outcome-tag victory-tag">RUN COMPLETE</div>
      <h2 class="outcome-title victory-title">ROOT ACCESS RESTORED</h2>
      <pre class="victory-art">Segment_0x00 survived.
  kernel.panic :: TERMINATED
  Garbage collector :: OFFLINE
  All daemons :: KILLED</pre>
      <div class="run-stats">
        <div class="run-stat"><span class="label">ENCOUNTERS</span><span class="stat-value">4/4 cleared</span></div>
        <div class="run-stat"><span class="label">DAMAGE DEALT</span><span class="stat-value">${stats.totalDamageDealt}</span></div>
        <div class="run-stat"><span class="label">DAMAGE TAKEN</span><span class="stat-value">${stats.totalDamageTaken}</span></div>
        <div class="run-stat"><span class="label">CARDS PLAYED</span><span class="stat-value">${stats.totalCardsPlayed}</span></div>
        <div class="run-stat"><span class="label">ROUNDS</span><span class="stat-value">${stats.totalRoundsSurvived}</span></div>
        <div class="run-stat"><span class="label">BEST HIT</span><span class="stat-value">${stats.highestSingleHit} dmg</span></div>
      </div>
    `;

    const newRun = document.createElement('button');
    newRun.className = 'action-button primary outcome-reboot victory-btn';
    newRun.textContent = 'NEW RUN :: restart kernel';
    newRun.addEventListener('click', () => {
      this.combat.fullReset();
      this.prevOutcome = 'ongoing';
      this.appState = 'combat';
      this.render();
    });
    screen.appendChild(newRun);
    return screen;
  }

  // ── Deck Viewer ────────────────────────────────────────────────────────────

  private buildDeckViewerScreen(snap: CombatSnapshot): HTMLElement {
    const screen = document.createElement('div');
    screen.className = 'deck-viewer-screen';

    const header = document.createElement('div');
    header.className = 'deck-viewer-header';
    header.innerHTML = `
      <div>
        <div class="outcome-tag">DECK VIEWER</div>
        <h2 class="deck-viewer-title">${snap.deckContents.length} cards in memory</h2>
      </div>
      <span class="deck-viewer-hint">Press D or ESC to close</span>
    `;

    const grid = document.createElement('div');
    grid.className = 'deck-viewer-grid';

    // Group by id and count duplicates
    const countMap = new Map<string, number>();
    for (const c of snap.deckContents) countMap.set(c.id, (countMap.get(c.id) ?? 0) + 1);
    const seen = new Set<string>();

    for (const card of snap.deckContents) {
      if (seen.has(card.id)) continue;
      seen.add(card.id);
      const count = countMap.get(card.id) ?? 1;
      const el = document.createElement('div');
      el.className = `deck-card rarity-${card.rarity ?? 'common'}`;
      el.innerHTML = `
        ${count > 1 ? `<div class="deck-card-count">×${count}</div>` : ''}
        <div class="card-header">
          <div>
            <div class="card-id">${card.id}</div>
            <div class="card-name" style="font-size:22px">${card.name}</div>
          </div>
          <div class="card-cost">CPU ${card.cost}</div>
        </div>
        <div class="card-ascii">${card.ascii}</div>
        <div class="draft-desc">${card.description}</div>
        <div class="card-tags">${card.tags.slice(0, 3).map((t) => `<span class="chip">${t}</span>`).join('')}</div>
      `;
      grid.appendChild(el);
    }

    screen.append(header, grid);
    return screen;
  }

  // ── HUD Sections ───────────────────────────────────────────────────────────

  private renderBoot(snap: CombatSnapshot): HTMLElement {
    const boot = document.createElement('header');
    boot.className = 'boot';

    const pct = Math.round((snap.encounterNumber - 1) / snap.maxEncounters * 100);
    const nodes = Array.from({ length: snap.maxEncounters }, (_, i) => {
      const past = i < snap.encounterNumber - 1;
      const current = i === snap.encounterNumber - 1;
      const cls = past ? 'node done' : current ? 'node current' : 'node';
      return `<span class="${cls}">${i + 1 === snap.maxEncounters ? '★' : '●'}</span>`;
    }).join('<span class="node-line">─</span>');

    boot.innerHTML = `
      <div>
        <h1>NULL_POINTER</h1>
        <span>Segment_0x00 :: kernel module</span>
      </div>
      <div class="encounter-tracker">
        <div class="encounter-nodes">${nodes}</div>
        <div class="encounter-label">ENC ${snap.encounterNumber}/${snap.maxEncounters}</div>
        <div class="bar encounter-bar" style="margin-top:4px">
          <div class="bar-fill player" style="width:${pct}%"></div>
        </div>
      </div>
    `;
    return boot;
  }

  private renderStats(snap: CombatSnapshot): HTMLElement {
    const grid = document.createElement('section');
    grid.className = 'stats-grid';
    grid.appendChild(this.renderFighterCard('PLAYER', snap.player, 'player'));
    for (const [i, enemy] of snap.enemies.entries()) {
      grid.appendChild(this.renderFighterCard(i === 0 ? 'ENEMY' : 'MINION', enemy, 'enemy'));
    }
    return grid;
  }

  private renderFighterCard(label: string, fighter: CombatSnapshot['player'], tone: 'player' | 'enemy'): HTMLElement {
    const card = document.createElement('article');
    const isP2 = fighter.phaseTwo;
    card.className = `stat-card panel ${tone === 'enemy' ? 'enemy' : ''}${isP2 ? ' phase-two' : ''}`;

    const hpPct = (fighter.hp / fighter.maxHp) * 100;
    const cpuPct = (fighter.cpu / fighter.cpuMax) * 100;
    const statuses = fighter.statuses.length > 0
      ? fighter.statuses.map((s) => `<span class="chip status-chip">${s.kind} ${s.value}/${s.duration}</span>`).join('')
      : '<span class="chip">stable</span>';

    const stackEntry = fighter.stackCount > 0
      ? `<span class="label">Stack</span><span class="value stack-count">${fighter.stackCount} entr${fighter.stackCount === 1 ? 'y' : 'ies'}</span>`
      : '';

    const armorEntry = fighter.armor > 0
      ? `<span class="label">Armor</span><span class="value" style="font-size:16px;color:var(--info)">${fighter.armor}</span>`
      : '';

    card.innerHTML = `
      ${isP2 ? '<div class="phase-two-badge">⚠ PHASE 2</div>' : ''}
      <span class="label">${label}</span>
      <span class="value" style="font-size:16px">${fighter.name}</span>
      <span class="label" style="margin-top:2px">${fighter.archetype}</span>
      <span class="label" style="margin-top:8px">HP ${fighter.hp}/${fighter.maxHp}</span>
      <div class="bar"><div class="bar-fill ${tone}" style="width:${hpPct}%"></div></div>
      <span class="label">CPU ${fighter.cpu}/${fighter.cpuMax}</span>
      <div class="bar"><div class="bar-fill cpu" style="width:${cpuPct}%"></div></div>
      ${armorEntry}
      ${stackEntry}
      <div class="card-tags" style="margin-top:8px">${statuses}</div>
    `;
    return card;
  }

  private renderRelics(snap: CombatSnapshot): HTMLElement | DocumentFragment {
    if (snap.relics.length === 0) return document.createDocumentFragment();
    const section = document.createElement('section');
    section.className = 'relics-section';
    section.innerHTML = `<span class="label">Installed Relics</span>`;
    const list = document.createElement('div');
    list.className = 'relics-list';
    for (const relic of snap.relics) {
      const el = document.createElement('div');
      el.className = 'relic-chip';
      el.title = relic.description;
      el.innerHTML = `<span class="relic-ascii">${relic.ascii}</span><span>${relic.name}</span>`;
      list.appendChild(el);
    }
    section.appendChild(list);
    return section;
  }

  private renderTelemetry(snap: CombatSnapshot): HTMLElement {
    const telemetry = document.createElement('section');
    telemetry.className = 'telemetry';

    const fieldDef = snap.playerFieldAddress
      ? snap.fieldCells.find((fc) => fc.address === snap.playerFieldAddress)
      : null;

    telemetry.append(
      this.makeInfoCard('Position', `${snap.player.position.q},${snap.player.position.r}`),
      this.makeInfoCard('Field Zone', snap.playerFieldAddress ? `${snap.playerFieldAddress}` : 'none'),
      this.makeInfoCard('Deck / Discard', `${snap.drawPileCount} / ${snap.discardPileCount}`),
      this.makeInfoCard('Enemy Range', `${snap.grid.distance(snap.player.position, snap.enemy.position)} hex`),
    );

    if (snap.playerStackCount > 0) {
      telemetry.appendChild(this.makeInfoCard('Stack', `${snap.playerStackCount} → POP for ${snap.playerStackCount * 4} burst`));
    }
    if (fieldDef) {
      telemetry.appendChild(this.makeInfoCard('Zone Effect', fieldDef.description));
    }
    return telemetry;
  }

  private makeInfoCard(title: string, value: string): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'panel telemetry-card';
    panel.innerHTML = `<span class="label">${title}</span><span class="telemetry-value">${value}</span>`;
    return panel;
  }

  private renderLog(lines: string[]): HTMLElement {
    const log = document.createElement('section');
    log.className = 'log';
    log.innerHTML = '<span class="label">System Log</span>';
    const body = document.createElement('div');
    body.className = 'log-lines';
    for (const line of lines) {
      const row = document.createElement('div');
      row.className = 'log-line';
      row.textContent = `> ${line}`;
      body.appendChild(row);
    }
    log.appendChild(body);
    return log;
  }

  private renderRoundBox(snap: CombatSnapshot): HTMLElement {
    const box = document.createElement('div');
    box.className = 'round-box';
    box.innerHTML = `<span class="label">Round</span><strong>${snap.round}</strong>`;
    return box;
  }

  private renderIntent(intent: string, name?: string, isP2?: boolean): HTMLElement {
    const box = document.createElement('div');
    box.className = `intent${isP2 ? ' intent-p2' : ''}`;
    box.innerHTML = `<span class="label">${name ?? 'Enemy'}</span><strong>${intent}</strong>`;
    return box;
  }

  // ── Hand ───────────────────────────────────────────────────────────────────

  private renderHand(snap: CombatSnapshot): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.append(this.renderHandHeader(snap));

    const grid = document.createElement('div');
    grid.className = 'hand-grid';

    if (snap.hand.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Hand empty. End turn to draw new cards.';
      grid.appendChild(empty);
    } else {
      snap.hand.forEach((card, index) => {
        const playability = snap.playability[card.id];
        const isSelected = snap.selectedCardId === card.id;
        const isTargetingMode = isSelected && snap.validTargetHexes.length > 0;

        const button = document.createElement('button');
        button.className = `card rarity-${card.rarity ?? 'common'}${isSelected ? ' selected' : ''}`;
        button.disabled = !playability.canPlay;
        button.innerHTML = `
          <div class="card-shortcut">${index + 1}</div>
          <div class="card-header">
            <div>
              <div class="card-id">${card.id}</div>
              <h3 class="card-name">${card.name}</h3>
            </div>
            <div class="card-cost">CPU ${card.cost}</div>
          </div>
          <div class="card-ascii">${card.ascii}</div>
          <div class="card-desc">${card.description}</div>
          <div class="label">${formatCardTarget(card)}</div>
          ${isTargetingMode ? '<div class="targeting-hint label">TARGETING — click hex</div>' : ''}
          ${playability.reason ? `<div class="label locked-hint">LOCKED :: ${playability.reason}</div>` : ''}
          <div class="card-tags">${card.tags.slice(0, 3).map((t) => `<span class="chip">${t}</span>`).join('')}</div>
        `;
        button.addEventListener('click', () => {
          const needsTarget = card.target === 'enemy'
            || card.target === 'aoe'
            || (card.target === 'self' && card.effects.some((ef) => ef.type === 'moveSelf'));
          if (needsTarget) {
            this.combat.selectCard(card.id);
          } else {
            this.combat.playCard(card.id);
            soundSystem.playCardPlay();
            this.flushDamageEvents();
          }
          this.render();
        });
        grid.appendChild(button);
      });
    }

    wrapper.appendChild(grid);
    return wrapper;
  }

  private renderHandHeader(snap: CombatSnapshot): HTMLElement {
    const header = document.createElement('div');
    header.className = 'hand-header';

    const title = document.createElement('div');
    title.innerHTML = `
      <span class="label">Opcode Hand</span>
      <div class="value" style="font-size:15px">${snap.hand.length} cards · ${snap.player.cpu} CPU · <span style="color:var(--muted);font-size:12px">[1-5] select · [E] end turn · [D] deck</span></div>
    `;

    const actions = document.createElement('div');
    actions.className = 'hand-actions';

    const muteBtn = document.createElement('button');
    muteBtn.className = 'action-button';
    muteBtn.textContent = soundSystem.isMuted ? '🔇 Unmute' : '🔊 Mute';
    muteBtn.addEventListener('click', () => {
      soundSystem.toggleMute();
      muteBtn.textContent = soundSystem.isMuted ? '🔇 Unmute' : '🔊 Mute';
    });

    const deckBtn = document.createElement('button');
    deckBtn.className = 'action-button';
    deckBtn.textContent = `Deck [${snap.deckSize}]`;
    deckBtn.addEventListener('click', () => {
      this.appState = this.appState === 'deckviewer' ? 'combat' : 'deckviewer';
      this.renderDeckViewer();
    });

    const endTurn = document.createElement('button');
    endTurn.className = 'action-button primary';
    endTurn.textContent = 'End Turn [E]';
    endTurn.disabled = !snap.canEndTurn;
    endTurn.addEventListener('click', () => {
      this.combat.endTurn();
      soundSystem.playEndTurn();
      this.flushDamageEvents();
      this.render();
    });

    actions.append(muteBtn, deckBtn, endTurn);
    header.append(title, actions);
    return header;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCardTarget(card: CombatSnapshot['hand'][number]): string {
  if (card.target === 'enemy') return `TARGET ENEMY · RANGE ${card.range?.min ?? 1}–${card.range?.max ?? 1}`;
  if (card.target === 'aoe') return `TARGET AREA · BLAST R${card.range?.max ?? 2}`;
  if (card.target === 'self') return 'TARGET SELF';
  return 'NO TARGET';
}
