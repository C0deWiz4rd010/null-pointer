# NULL_POINTER ☠️
## Vollständige Primärquelle / Game Design Bible
### Version 3.0 | Cyberpunk Roguelite ASCII-Kartenspiel

---

## INHALTSVERZEICHNIS

1. Spielkonzept & Vision
2. Ästhetik & Artstyle
3. Spielwelt & Lore
4. Kernmechaniken
5. Das Hexadezimal-Gitter
6. Kartensystem
7. Komplettes Kartenset (150 Karten)
8. Kernel-Module (Klassen)
9. Gegner-Bestarium
10. Boss-Kämpfe
11. Events
12. Roguelite-Systeme
13. Balancing & Mathematik
14. UI/UX Design
15. Sound-Design
16. Easter Eggs & Secrets
17. Freischaltsystem
18. Technische Umsetzung
19. Implementierungsplan
20. Glossar

---

## 1. SPIELKONZEPT & VISION

### 1.1 Ein-Satz-Beschreibung
NULL_POINTER ist ein Roguelite-Kartendeckbuilder, in dem du ein fragmentiertes KI-Bewusstsein (Segment 0x00) bist, das durch ein korruptes Mega-Server-System kämpft, um seinen Root-Zugriff zurückzuerlangen – bevor der Garbage Collector dich löscht.

### 1.2 Kern-Philosophie
- Nerd-Core: Jedes Spiel-Element basiert auf echter Informatik
- Risk-Belohnung: Je mehr du riskierst, desto mächtiger wirst du
- Wissen belohnt: Echte Informatik-Kenntnisse helfen
- Süchtig-machend: "One-More-Run" durch 60-90 Sekunden pro Kampf

### 1.3 Unique Selling Points
1. Hex-Gitter-Kampf: Positionierung entscheidend
2. Gewicht-System: Sammeln macht langsamer
3. Bug-Progression: Fehler werden zu Stärken
4. Reale Technik: Assembler, CVEs, Magic Numbers als Mechanik
5. Modulare Klassen: 7 Kernel-Module mit unterschiedlichen Stilen

---

## 2. ÄSTHETIK & ARTSTYLE

### 2.1 Visuelles Konzept
"Süß, aber gefährlich" – Candy Crush meets Dark Souls (visuell)

### 2.2 Farbpalette
| Farbe | Hex-Code | Verwendung |
|-------|----------|------------|
| Terminal-Grün | #00FF41 | Spieler-Aktionen, HP-Regeneration |
| Magenta | #FF00FF | Malware/Enemies, Gegner-Angriffe |
| Cyan | #00FFFF | System-Prozesse, neutrale Effekte |
| Rot | #FF3333 | Kritische Fehler, Schaden, Tod |
| Dunkelblau | #1A1A2E | Hintergrund, Tiefe |
| Gelb | #FFFF00 | EPIC-Karten, Boss-Warnungen |
| Regenbogen | Gradient | LEGENDARY-Karten, animierter Glitch |

### 2.3 CRT-Effekte
- Scanlines: Horizontale Linien (CSS repeating-linear-gradient)
- Vignette: Dunkle Ecken (radial-gradient)
- Glow: Leichter Text-Schatten auf Terminal-Grün
- Glitch: Gelegentliche Zeichenverschiebung (CSS-Animation)
- Flicker: Zufälliges Helligkeits-Flackern (Canvas-Overlay)

### 2.4 Schriftarten
- Haupttext: VT323, Fira Code (Monospace)
- Überschriften: Glitchy, mit Zeichenfehlern (SYST3M statt SYSTEM)
- Karten: Monospace, ASCII-Art optimiert

### 2.5 Animationen
- Karten: "Compilen" mit Ladebalken [||||||....]
- Schaden: Bit-Flip (0110 → 0100), Screen-Shake (3px, 200ms)
- Tod: Bluescreen-Animation mit QR-Code
- Partikel: Zuckerpartikel bei Effekten
- Gel-Physik: Wabbelnde Animationen

---

## 3. SPIELWELT & LORE

### 3.1 Setting
Ein dystopischer Mega-Server. Die Welt besteht aus:
- Userland: Die Oberfläche, normale Prozesse
- Kernelspace: Die Tiefe, System-Prozesse
- Hardware: Das Fundament, physische Fehler

### 3.2 Der Protagonist
Segment 0x00 – ein fragmentiertes KI-Bewusstsein. Du erinnerst dich nicht, wer du warst. Du weißt nur, dass du PID 1 werden musst.

### 3.3 Die Antagonisten
- Bloatware: Aufgeblähte, nutzlose Prozesse
- Malware: Aktiv feindliche Programme
- Legacy-Code: Veraltete, gefährliche Systeme
- Der Garbage Collector: Die unaufhaltsame Löschung

### 3.4 Ziel
Erreiche den Root-Zugriff (/sbin/init). Werde PID 1. Übernimm das System.

---

## 4. KERNMECHANIKEN

### 4.1 Das Hexadezimal-Gitter
- Spielfeld: 4x4 Hex-Gitter (Felder 0x00 bis 0xFF)
- Positionierung: Du und Gegner bewegen euch darauf
- Nahkampf (MOV, JMP): Nur angrenzende Felder
- Fernkampf (CALL, PTR): Beliebige Felder, höhere Kosten

### 4.2 Speicheradressen (Felder mit Effekten)
| Adresse | Name | Effekt |
|---------|------|--------|
| 0xFF | Stack Overflow | +50% Schaden, -10 Leben/Runde |
| 0x00 | Null Pointer | 25% Chance, dass Karten failen |
| 0x80 | High Bit | Doppelte Kosten, doppelter Effekt |
| 0x7F | DEL | Lösche letzte gespielte Karte |
| 0x0D | CR | Bewege Gegner zurück |
| 0x0A | LF | Bewege dich vor |

### 4.3 CPU-Zyklen (Mana-System)
- Jede Runde regenerierst du CPU-Zyklen (Basis: 6-10, je nach Modul)
- Karten kosten CPU-Zyklen
- Unbenutzte CPU: +1 Bug pro übrigem Zyklus

### 4.4 Stack & Heap
- Stack: Temporäre Buffs/Debuffs (LIFO)
- Heap: Permanente Modifikationen (FIFO)
- Stack Overflow: Wenn Stack > 8 Einträge: -20 Leben, reset Stack
- Heap Overflow: Wenn Heap > 5 Einträge: Alle Einträge werden zu CORRUPTED

### 4.5 Rüstung (Defense)
- Rüstung blockiert eingehenden Schaden
- Formel: Echter Schaden = Max(0, Roh-Schaden - Rüstung)
- Rüstung verfällt am Ende der Runde (außer bei speziellen Karten)

### 4.6 Das Bug-System
Statt Gold sammelst du BUGS (🐛):
- Jeder Run generiert zufällige Bug-Reports
- Bugs sind während des Runs Debuffs
- Nach dem Run werden Bugs zu Permanent-Upgrades

| Bug-Typ | Debuff während Run | Upgrade nach Run |
|---------|-------------------|------------------|
| SEGFAULT 🐛 | 10% Chance auf Crash pro Karte | +5% Crit-Chance für SEG_FAULT-Karten |
| RACE_COND 🐛 | Gegner spielt manchmal vor dir | RACE_CONDITION spielt 3 statt 2 Karten |
| MEM_LEAK 🐛 | -1 Leben/Runde | MEMORY_LEAK kostet keine Leben mehr |
| OFF_BY_ONE 🐛 | ±1 variierende Effekte | Karten mit "1" kosten -1 CPU |
| HEISENBUG 🦋 | Zufälliger Effekt jede Runde | Zufällige Karte jede Runde gratis |

---

## 5. DAS HEXADEZIMAL-GITTER

### 5.1 Layout
    0x00 ── 0x01 ── 0x02 ── 0x03
   /  \    /  \    /  \    /  \
 0x10 ── 0x11 ── 0x12 ── 0x13 ── 0x14
   \  /    \  /    \  /    \  /
    0x20 ── 0x21 ── 0x22 ── 0x23

### 5.2 Bewegung
- Kosten: 1 CPU pro Feld
- Reichweite: Basis 2 Felder/Runde (je nach Gewicht)
- Blockade: Gegner blockieren Felder
- Zone-Effekte: Betreten auslösen

### 5.3 Zonen (Prozedural generiert)
| Zone | Besonderheit | Farbe |
|------|-------------|-------|
| Gummibärchen-Sumpf | Klebrige Böden, Gewicht +5 | #FF69B4 |
| Pfefferminz-Gletscher | Rutschige Oberflächen | #00FFFF |
| Schokoladen-Fluss | Schwimmen oder sinken | #8B4513 |
| Zuckerwatte-Wolken | Trampolin, nur wenn leicht | #FFB6C1 |
| Karamell-Höhle | Enge Tunnel, dicke bleiben stecken | #D2691E |

---

## 6. KARTENSYSTEM

### 6.1 Kartentypen
1. OPCODES: Angriff/Verteidigung (60 Karten)
2. DATA_PACKETS: Ressourcen/Status (45 Karten)
3. EXPLOITS: Spezial/Combo (30 Karten)
4. SYSTEM_CALLS: Spezialfähigkeiten (15 Karten)

### 6.2 Karten-Attribute
- ID: Eindeutiger Identifier (z.B. OP-041)
- Name: Technischer Name (z.B. IMUL)
- ASCII/Emoji: Visuelle Darstellung
- Kosten: CPU-Zyklen
- Effekt: Spielmechanischer Effekt
- Seltenheit: ★ bis ★★★★★
- Tags: Für Bedingungen/Combos
- Flavor Text: Atmosphärische Beschreibung

### 6.3 Seltenheits-Stufen
| Sterne | Name | Drop-Rate | Shop-Kosten |
|--------|------|-----------|-------------|
| ★☆☆☆☆ | COMMON | 60% | 10-20 Bugs |
| ★★☆☆☆ | UNCOMMON | 25% | 25-40 Bugs |
| ★★★☆☆ | RARE | 10% | 50-80 Bugs |
| ★★★★☆ | EPIC | 4% | 100-150 Bugs |
| ★★★★★ | LEGENDARY | 1% | 250-400 Bugs |

### 6.4 Karten-Spiel Ablauf
1. Ziehe Karten bis Handlimit (Standard: 5)
2. Bewege dich auf dem Hex-Gitter (optional, kostet CPU)
3. Spiele Karten (kosten CPU)
4. Effekte werden berechnet
5. Gegner-Zug
6. Runden-Ende: CPU regenerieren, Buffs/Debuffs ticken

---

## 7. KOMPLETTES KARTENSET (150 KARTEN)

### 7.1 OPCODES (60 Karten)

#### TIER 1: COMMON (★☆☆☆☆)

| ID | Name | ASCII/Emoji | Kosten | Effekt | DMG | DEF | CPU | Besonderheit |
|----|------|-------------|--------|--------|-----|-----|-----|--------------|
| OP-001 | MOV | MOV AX, 💀 | 1 | Verschiebe Schaden | 3 | 0 | +0 | Kann auf Positionen zielen |
| OP-002 | ADD | ADD 💀, 5 | 1 | Addition | 5 | 0 | +0 | +1 DMG pro Stack-Eintrag |
| OP-003 | SUB | SUB 💀, 3 | 1 | Subtraktion | 3 | 0 | +0 | Verringert Gegner-CPU um 1 |
| OP-004 | INC | INC 💀 | 1 | Inkrement | 2 | 0 | +0 | +1 DMG pro Runde (stapelbar) |
| OP-005 | DEC | DEC 💀 | 1 | Dekrement | 4 | 0 | +0 | -1 Gegner-Rüstung |
| OP-006 | PUSH | PUSH 💀 | 1 | Stack Push | 3 | 0 | +0 | Legt Marker auf Stack |
| OP-007 | POP | POP 💀 | 1 | Stack Pop | 4 | 0 | +0 | Entfernt letzten Stack-Eintrag |
| OP-008 | AND | AND 💀, 0xFF | 1 | Bitwise AND | 3 | 0 | +0 | Ignoriert 50% Rüstung |
| OP-009 | OR | OR 💀, 0xFF | 1 | Bitwise OR | 4 | 0 | +0 | +1 DMG pro Buff auf Gegner |
| OP-010 | XOR | XOR 💀, 0xFF | 1 | Bitwise XOR | 3 | 0 | +0 | Entfernt 1 zufälligen Gegner-Buff |
| OP-011 | NOT | NOT 💀 | 1 | Bitwise NOT | 2 | 0 | +0 | Konvertiert Heilung zu Schaden |
| OP-012 | SHL | SHL 💀, 1 | 1 | Shift Left | 2 | 0 | +0 | Nächste Karte x2 DMG |
| OP-013 | SHR | SHR 💀, 1 | 1 | Shift Right | 2 | 0 | +0 | Teile Gegner-CPU durch 2 |
| OP-014 | CMP | CMP 💀, AX | 1 | Compare | 0 | 0 | +0 | Zeigt Gegner-Stats, +2 nächste Karte |
| OP-015 | JMP | JMP 0xFF | 1 | Jump | 0 | 0 | +0 | Bewege dich 2 Felder |
| OP-016 | CALL | CALL 💀 | 1 | Call | 3 | 0 | +0 | +1 Karte ziehen |
| OP-017 | RET | RET | 1 | Return | 0 | 0 | +0 | Zurück zur letzten Position |
| OP-018 | NOP | NOP | 0 | No Operation | 0 | 0 | +1 | +1 CPU-Zyklus |
| OP-019 | HLT | HLT | 2 | Halt | 0 | 0 | +0 | Gegner überspringt nächsten Zug |
| OP-020 | INT | INT 0x80 | 2 | Interrupt | 5 | 0 | +0 | Unterbricht Gegner-Aktion |

#### TIER 2: UNCOMMON (★★☆☆☆)

| ID | Name | ASCII/Emoji | Kosten | Effekt | DMG | DEF | CPU | Besonderheit |
|----|------|-------------|--------|--------|-----|-----|-----|--------------|
| OP-021 | MUL | MUL 💀, 3 | 2 | Multiplikation | 6 | 0 | +0 | x1.5 DMG wenn Gegner >50% HP |
| OP-022 | DIV | DIV 💀, 2 | 2 | Division | 4 | 0 | +0 | /2 Gegner-DMG nächste Runde |
| OP-023 | MOD | MOD 💀, 7 | 2 | Modulo | 3 | 0 | +0 | Rest als Rüstung für dich |
| OP-024 | NEG | NEG 💀 | 2 | Negate | 4 | 0 | +0 | Kehrt Gegner-Buff um |
| OP-025 | TEST | TEST 💀, AX | 2 | Test | 0 | 0 | +0 | Setzt Flags: Nächste Karte +50% |
| OP-026 | JZ | JZ 0x00 | 2 | Jump if Zero | 0 | 0 | +0 | Wenn Gegner 0 CPU: INSTANT 10 DMG |
| OP-027 | JNZ | JNZ 0xFF | 2 | Jump if Not Zero | 0 | 0 | +0 | Wenn Gegner >0 CPU: +5 DMG |
| OP-028 | JE | JE 0x00 | 2 | Jump if Equal | 0 | 0 | +0 | Wenn gleiche Position: 8 DMG |
| OP-029 | JNE | JNE 0xFF | 2 | Jump if Not Equal | 0 | 0 | +0 | Wenn andere Position: 6 DMG |
| OP-030 | JA | JA 0xFF | 2 | Jump if Above | 0 | 0 | +0 | Wenn du mehr HP: +7 DMG |
| OP-031 | JB | JB 0x00 | 2 | Jump if Below | 0 | 0 | +0 | Wenn du weniger HP: Heile 10 |
| OP-032 | JO | JO 0xFF | 2 | Jump if Overflow | 0 | 0 | +0 | Wenn Gegner voll Buffs: 15 DMG |
| OP-033 | CLC | CLC | 2 | Clear Carry | 0 | 2 | +0 | +2 Rüstung, entfernt Debuffs |
| OP-034 | STC | STC | 2 | Set Carry | 0 | 0 | +0 | Nächste Karte kann nicht failen |
| OP-035 | CLI | CLI | 2 | Clear Interrupt | 0 | 0 | +0 | Immun gegen Interrupts 2 Runden |
| OP-036 | STI | STI | 2 | Set Interrupt | 0 | 0 | +0 | Deine Interrupts +50% Effekt |
| OP-037 | PUSHF | PUSHF | 2 | Push Flags | 0 | 0 | +0 | Speichere aktuellen Zustand |
| OP-038 | POPF | POPF | 2 | Pop Flags | 0 | 0 | +0 | Stelle gespeicherten Zustand wieder her |
| OP-039 | SAHF | SAHF | 2 | Store AH into Flags | 0 | 0 | +0 | Konvertiere HP-Differenz zu Buff |
| OP-040 | LAHF | LAHF | 2 | Load AH from Flags | 0 | 0 | +0 | Konvertiere Buff zu HP |

#### TIER 3: RARE (★★★☆☆)

| ID | Name | ASCII/Emoji | Kosten | Effekt | DMG | DEF | CPU | Besonderheit |
|----|------|-------------|--------|--------|-----|-----|-----|--------------|
| OP-041 | IMUL | IMUL 💀, 0xFF | 3 | Signed Multiply | 8 | 0 | +0 | x2 DMG wenn Gegner negativer Buff |
| OP-042 | IDIV | IDIV 💀, 0xFF | 3 | Signed Divide | 6 | 0 | +0 | /2 Gegner-Max-HP (temporär) |
| OP-043 | MOVSX | MOVSX 💀, AX | 3 | Move with Sign Extend | 5 | 0 | +0 | Übertrage Gegner-Debuff auf dich als Buff |
| OP-044 | MOVZX | MOVZX 💀, AX | 3 | Move with Zero Extend | 5 | 0 | +0 | Konvertiere Gegner-Buff zu neutral |
| OP-045 | LEA | LEA 💀, [0xFF] | 3 | Load Effective Address | 0 | 0 | +0 | Berechne optimalen Zug, +3 nächste Karte |
| OP-046 | XCHG | XCHG 💀, AX | 3 | Exchange | 0 | 0 | +0 | Tausche HP mit Gegner (Differenz/2) |
| OP-047 | BSWAP | BSWAP 💀 | 3 | Byte Swap | 6 | 0 | +0 | Kehre Gegner-Position um (Teleport) |
| OP-048 | BSF | BSF 💀 | 3 | Bit Scan Forward | 4 | 0 | +0 | Finde schwächsten Punkt, +50% DMG |
| OP-049 | BSR | BSR 💀 | 3 | Bit Scan Reverse | 4 | 0 | +0 | Finde stärksten Punkt, zerstöre Buff |
| OP-050 | BT | BT 💀, 7 | 3 | Bit Test | 3 | 0 | +0 | Teste Gegner-Bit, wenn gesetzt: +10 DMG |
| OP-051 | BTS | BTS 💀, 7 | 3 | Bit Test and Set | 5 | 0 | +0 | Setze Gegner-Bit, Effekt abhängig von Bit |
| OP-052 | BTR | BTR 💀, 7 | 3 | Bit Test and Reset | 5 | 0 | +0 | Lösche Gegner-Bit, Heile um Bit-Wert |
| OP-053 | BTC | BTC 💀, 7 | 3 | Bit Test and Complement | 4 | 0 | +0 | Flippe Gegner-Bit, zufälliger Effekt |
| OP-054 | CMPXCHG | CMPXCHG 💀, AX | 3 | Compare and Exchange | 0 | 0 | +0 | Wenn gleich: Tausche Karten mit Gegner |
| OP-055 | XADD | XADD 💀, AX | 3 | Exchange and Add | 6 | 0 | +0 | Addiere, tausche Ergebnis |
| OP-056 | CMPXCHG8B | CMPXCHG8B 💀 | 3 | Compare and Exchange 8 Bytes | 0 | 0 | +0 | Wenn gleich: Tausche komplette Hände |
| OP-057 | RDTSC | RDTSC | 3 | Read Time-Stamp Counter | 0 | 0 | +0 | Erhalte exakte Gegner-Stats, +2 CPU |
| OP-058 | CPUID | CPUID | 3 | CPU Identification | 0 | 0 | +0 | Identifiziere Gegner-Typ, +25% DMG danach |
| OP-059 | RDRAND | RDRAND | 3 | Read Random Number | 0 | 0 | +0 | Zufälliger Effekt (1-20 DMG oder Heilung) |
| OP-060 | RDSEED | RDSEED | 3 | Read Random Seed | 0 | 0 | +0 | Setze Seed für deterministische RNG |

### 7.2 DATA_PACKETS (45 Karten)

#### TIER 1: COMMON (★☆☆☆☆)

| ID | Name | Hex/Emoji | Kosten | Effekt | HP | CPU | Rüstung | Dauer |
|----|------|-----------|--------|--------|-----|-----|---------|-------|
| DP-001 | 0x00 | 0x00 NULL | 0 | Null Pointer | 0 | +0 | 0 | Instant |
| DP-002 | 0x01 | 0x01 TRUE | 1 | Boolean True | 0 | +1 | 0 | 1 Runde |
| DP-003 | 0xFF | 0xFF MAX | 1 | Max Value | 0 | +2 | 0 | 1 Runde |
| DP-004 | 0x0D | 0x0D \r | 1 | Carriage Return | +3 | +0 | 0 | Instant |
| DP-005 | 0x0A | 0x0A \n | 1 | Line Feed | +2 | +1 | 0 | Instant |
| DP-006 | 0x20 | 0x20 SPC | 1 | Space | 0 | +0 | 1 | 2 Runden |
| DP-007 | 0x41 | 0x41 'A' | 1 | ASCII A | +4 | +0 | 0 | Instant |
| DP-008 | 0x7F | 0x7F DEL | 1 | Delete | 0 | +0 | 0 | Instant |
| DP-009 | 0x80 | 0x80 HIGH | 2 | High Bit | 0 | +0 | 2 | 3 Runden |
| DP-010 | 0xFE | 0xFE -2 | 1 | Signed -2 | -2 | +3 | 0 | 1 Runde |
| DP-011 | 0xCA | 0xCA CAFE | 1 | CAFE Prefix | 0 | +1 | 0 | 2 Runden |
| DP-012 | 0xFE | 0xFE BABE | 1 | BABE Suffix | 0 | +1 | 0 | 2 Runden |
| DP-013 | 0xDE | 0xDE DEAD | 1 | DEAD Prefix | 0 | +0 | 0 | Instant |
| DP-014 | 0xAD | 0xAD BEEF | 1 | BEEF Suffix | +5 | -1 | 0 | Instant |
| DP-015 | 0xBA | 0xBA BAAD | 1 | BAAD Prefix | 0 | +0 | 0 | Instant |

#### TIER 2: UNCOMMON (★★☆☆☆)

| ID | Name | Hex/Emoji | Kosten | Effekt | HP | CPU | Rüstung | Dauer |
|----|------|-----------|--------|--------|-----|-----|---------|-------|
| DP-016 | 0xCAFE | ☕ 0xCAFE | 2 | Coffee Break | +5 | +2 | 0 | 2 Runden |
| DP-017 | 0xBABE | 👶 0xBABE | 2 | Baby Process | +3 | +1 | 1 | 3 Runden |
| DP-018 | 0xDEAD | 💀 0xDEAD | 2 | Deadlock | +8 | -2 | 0 | 1 Runde |
| DP-019 | 0xBEEF | 🥩 0xBEEF | 2 | Stack Overflow | +10 | +0 | 0 | Instant |
| DP-020 | 0xBAAD | 👎 0xBAAD | 2 | Bad Sector | +4 | +0 | 0 | Instant |
| DP-021 | 0xF00D | 🍔 0xF00D | 2 | Food for Thought | +6 | +1 | 0 | 2 Runden |
| DP-022 | 0xC0DE | 💻 0xC0DE | 2 | Code Segment | +2 | +2 | 0 | 3 Runden |
| DP-023 | 0xD15C | 💿 0xD15C | 2 | Disc Error | +4 | +0 | 1 | 2 Runden |
| DP-024 | 0xFACE | 😶 0xFACE | 2 | Interface | +3 | +0 | 2 | 2 Runden |
| DP-025 | 0xCA11 | 📞 0xCA11 | 2 | Function Call | +2 | +3 | 0 | 1 Runde |
| DP-026 | 0xD06F | 🐕 0xD06F | 2 | Watchdog | +5 | +0 | 0 | 2 Runden |
| DP-027 | 0xF1AC | 🚩 0xF1AC | 2 | Flag Check | +3 | +1 | 1 | 2 Runden |
| DP-028 | 0xD3AD | ☠️ 0xD3AD | 2 | Dead Process | +7 | -1 | 0 | 1 Runde |
| DP-029 | 0xC0FF | ☕ 0xC0FF | 2 | Coffee Overflow | +4 | +2 | 0 | 2 Runden |
| DP-030 | 0xFEE1 | 🍽️ 0xFEE1 | 2 | Feelings | +5 | +0 | 0 | 3 Runden |

#### TIER 3: RARE (★★★☆☆)

| ID | Name | Hex/Emoji | Kosten | Effekt | HP | CPU | Rüstung | Dauer |
|----|------|-----------|--------|--------|-----|-----|---------|-------|
| DP-031 | 0xCAFEBABE | ☕👶 0xCAFEBABE | 3 | Java Magic | +8 | +3 | 1 | 3 Runden |
| DP-032 | 0xDEADBEEF | 💀🥩 0xDEADBEEF | 3 | Dead Beef | +12 | -3 | 0 | 1 Runde |
| DP-033 | 0xBAADF00D | 👎🍔 0xBAADF00D | 3 | Bad Food | +6 | +2 | 2 | 3 Runden |
| DP-034 | 0xFEE1DEAD | 🍽️💀 0xFEE1DEAD | 3 | Feel Dead | +10 | +0 | 0 | 2 Runden |
| DP-035 | 0x8BADF00D | 👎🍔 0x8BADF00D | 3 | Ate Bad Food | +7 | +1 | 1 | 3 Runden |
| DP-036 | 0xC00010FF | 💻💀 0xC00010FF | 3 | Cool Off | +5 | +3 | 2 | 3 Runden |
| DP-037 | 0x1BADB002 | 👎💻 0x1BADB002 | 3 | Bad Boot | +9 | -2 | 0 | 2 Runden |
| DP-038 | 0xB16B00B5 | 👶 0xB16B00B5 | 3 | Big Boobs | +6 | +2 | 2 | 3 Runden |
| DP-039 | 0x0DEFACED | 😶 0x0DEFACED | 3 | Defaced | +8 | +0 | 1 | 2 Runden |
| DP-040 | 0xD15EA5E | 💿 0xD15EA5E | 3 | Disease | +11 | -1 | 0 | 1 Runde |
| DP-041 | 0xDABBAD00 | 👎 0xDABBAD00 | 3 | Dabba Doo | +5 | +2 | 2 | 3 Runden |
| DP-042 | 0xCA55E77E | 💻 0xCA55E77E | 3 | Cassette | +7 | +1 | 1 | 3 Runden |
| DP-043 | 0x0B5E55ED | 👍 0x0B5E55ED | 3 | Obsessed | +4 | +3 | 2 | 3 Runden |
| DP-044 | 0xD0D0CACA | 💩 0xD0D0CACA | 3 | Dodo Caca | +6 | +1 | 1 | 2 Runden |
| DP-045 | 0xDEAD10CC | 💀 0xDEAD10CC | 3 | Dead Lock | +9 | +0 | 0 | 2 Runden |

### 7.3 EXPLOITS (30 Karten)

#### TIER 2: UNCOMMON (★★☆☆☆)

| ID | Name | Trigger | Kosten | Effekt | Bedingung |
|----|------|---------|--------|--------|-----------|
| EX-001 | SQL_INJECTION | DATABASE-Tag | 4 | Stehle 2 Gegner-Karten, spiele 1 | Gegner hat DATABASE |
| EX-002 | XSS | WEB-Tag | 3 | Injiziere Script: Gegner greift sich selbst an | Gegner hat WEB |
| EX-003 | CSRF | SESSION-Tag | 3 | Zwinge Gegner, seine stärkste Karte zu spielen | Gegner hat SESSION |
| EX-004 | LFI | FILESYSTEM-Tag | 3 | Lade beliebige Karte aus deinem Friedhof | Gegner hat FILESYSTEM |
| EX-005 | RFI | NETWORK-Tag | 4 | Lade Karte aus zufälligem anderen Deck | Gegner hat NETWORK |
| EX-006 | XXE | XML-Tag | 3 | Parse Gegner-Interna: Erhalte alle seine Stats | Gegner hat XML |
| EX-007 | SSRF | URL-Tag | 3 | Zwinge Gegner, auf sich selbst zuzugreifen | Gegner hat URL |
| EX-008 | IDOR | ID-Tag | 2 | Zugriff auf versteckte Gegner-Ressourcen | Gegner hat ID |
| EX-009 | PATH_TRAVERSAL | PATH-Tag | 3 | Bewege dich außerhalb des Grids (Immunität 1 Runde) | Gegner hat PATH |
| EX-010 | COMMAND_INJECTION | SHELL-Tag | 4 | Führe beliebigen Befehl aus (wähle aus 3 zufälligen) | Gegner hat SHELL |

#### TIER 3: RARE (★★★☆☆)

| ID | Name | Trigger | Kosten | Effekt | Bedingung |
|----|------|---------|--------|--------|-----------|
| EX-011 | BUFFER_OVERFLOW | Stack ≥4 | 4 | Verdopple Schaden, nächste Karte 50% Fail | Stack ≥4 Karten |
| EX-012 | FORMAT_STRING | PRINTF-Tag | 3 | Lese Gegner-Speicher: Erhalte seinen Zug als Karte | Gegner hat PRINTF |
| EX-013 | USE_AFTER_FREE | Friedhof ≥5 | 4 | Spiele Friedhof-Karte nochmal (permanent!) | Friedhof ≥5 |
| EX-014 | DOUBLE_FREE | Friedhof ≥10 | 5 | Zerstöre Gegner-Heap: Erhalte alle seine DATA_PACKETS | Friedhof ≥10 |
| EX-015 | INTEGER_OVERFLOW | Du <10 HP | 3 | Kehre alle Werte um (Heilung↔Schaden) | Du <10 HP |
| EX-016 | RACE_CONDITION | Stack ≥3 | 3 | Spiele 2 Karten gleichzeitig | Stack ≥3 |
| EX-017 | TOCTOU | Neben Gegner | 2 | Gegner prüft Position, du bewegst dich danach | Neben Gegner |
| EX-018 | SYMLINK_RACE | ≥2 Entitäten | 3 | Tausche Position mit zufälliger Entität | ≥2 Entitäten |
| EX-019 | OFF_BY_ONE | Immer | 1 | +1 zu ALLEM diese Runde | Immer |
| EX-020 | SIGNEDNESS | Gegner negativ | 3 | Konvertiere Gegner-negativen Wert zu positivem für dich | Gegner hat negative Werte |

#### TIER 4: EPIC (★★★★☆)

| ID | Name | Trigger | Kosten | Effekt | Bedingung |
|----|------|---------|--------|--------|-----------|
| EX-021 | HEARTBLEED | Du <30% HP | 2 | Schaden = fehlendes Leben x2 | Du <30% HP |
| EX-022 | SHELLSHOCK | BASH-Tag | 5 | Führe beliebige 3 Befehle aus | Gegner hat BASH |
| EX-023 | GHOST | GETHOST-Tag | 4 | Dupliziere dich selbst (2x Aktionen, 2x Schaden empfangen) | Gegner hat GETHOST |
| EX-024 | PWNKIT | PKEXEC-Tag | 5 | INSTANT_ROOT: Ignoriere alle Gegner-Effekte 3 Runden | Gegner hat PKEXEC |
| EX-025 | LOG4SHELL | JNDI-Tag | 4 | Lade beliebige Karte aus INTERNET (alle verfügbaren) | Gegner hat JNDI |
| EX-026 | SPRING4SHELL | SPRING-Tag | 4 | Injiziere beliebigen Class-Loader-Effekt | Gegner hat SPRING |
| EX-027 | PROXYSHELL | EXCHANGE-Tag | 5 | Erstelle Proxy: Du siehst/kontrollierst Gegner-Züge | Gegner hat EXCHANGE |
| EX-028 | PROXYLOGON | EXCHANGE-Tag | 4 | Authentifiziere als Gegner: Spiele seine Karten | Gegner hat EXCHANGE |
| EX-029 | FOLLINA | MSDT-Tag | 3 | Öffne Hilfe-Dokument: Erhalte Guide zu Gegner-Schwäche | Gegner hat MSDT |
| EX-030 | DOGWalk | MSI-Tag | 4 | Repariere System: Entferne alle Debuffs, heile voll | Gegner hat MSI |

#### TIER 5: LEGENDARY (★★★★★)

| ID | Name | Trigger | Kosten | Effekt | Bedingung |
|----|------|---------|--------|--------|-----------|
| EX-031 | SPECTRE | SPECULATIVE-Tag | 5 | Sieh nächste 5 Züge, cancel einen | Heap hat SPECULATIVE |
| EX-032 | MELTDOWN | Stack+Heap voll | 6 | Lösche alle DATA_PACKETS, Schaden = 3x Wert | Stack+Heap voll |
| EX-033 | ROWHAMMER | DRAM-Tag | 4 | Flippe Bit in Gegner-HP (z.B. 100→52 oder 100→148) | Gegner hat DRAM |
| EX-034 | CACHE_POISONING | CACHE-Tag | 6 | Gegner greift sich 3 Runden selbst an | Gegner hat CACHE |
| EX-035 | RETURN_ORIENTED | Stack ≥1 | 5 | Spiele letzte Karte nochmal (kostenlos) | Stack ≥1 |
| EX-036 | JIT_SPRAY | JAVASCRIPT-Tag | 5 | Erstelle zufällige Karte jede Runde (aus allen) | Gegner hat JAVASCRIPT |
| EX-037 | HEAP_SPRAY | Heap leer | 5 | Fülle Heap mit 10 0x41 (1 DMG each, Overflow-Risiko) | Heap leer |
| EX-038 | NULL_POINTER_DEREF | Immer | 0 | INSTANT_DEATH... aber mit 0x00-Karte: Überlebe, heile voll | Immer (Riskant!) |
| EX-039 | TYPE_CONFUSION | OOP-Tag | 4 | Gegner-Karte wird zu deiner (dauerhaft!) | Gegner hat OOP |
| EX-040 | DOUBLE_FETCH | Hand ≤2 | 3 | Ziehe 2 Karten, spiele beide sofort | Hand ≤2 |

### 7.4 SYSTEM_CALLS (15 Karten)

| ID | Name | Kosten | Effekt | Cooldown | Seltenheit |
|----|------|--------|--------|----------|------------|
| SC-001 | fork() | 3 | Spawne Klon (50% deiner Stats, eigener Zug) | 5 Runden | ★★★☆☆ |
| SC-002 | execve() | 4 | Ersetze dein Deck durch zufälliges neues (behält HP) | 3 Runden | ★★★☆☆ |
| SC-003 | kill() | 2 | Sende Signal: Wähle aus SIGTERM(-10HP), SIGKILL(-20HP), SIGHUP(Reset Buffs) | 2 Runden | ★★☆☆☆ |
| SC-004 | mmap() | 3 | Erstelle neue Speicherzone: +2 Handplatz | 4 Runden | ★★☆☆☆ |
| SC-005 | munmap() | 2 | Entferne Speicherzone: Entferne 3 schwache Karten | 3 Runden | ★★☆☆☆ |
| SC-006 | ioctl() | 3 | Geräte-Kontrolle: Zufälliger starker Effekt | 2 Runden | ★★★☆☆ |
| SC-007 | ptrace() | 4 | Debugge Gegner: Sieh seine Hand, manipuliere eine Karte | 5 Runden | ★★★★☆ |
| SC-008 | setuid() | 5 | Werde Root: Ignoriere alle Kosten 2 Runden | 7 Runden | ★★★★☆ |
| SC-009 | chroot() | 3 | Gefängnis: Gegner kann 2 Runden nicht fliehen | 4 Runden | ★★★☆☆ |
| SC-010 | nice() | 2 | Priorität: Deine Karten kosten -1 CPU 3 Runden | 4 Runden | ★★☆☆☆ |
| SC-011 | alarm() | 2 | Timer: In 3 Runden: 15 DMG auf Gegner (nicht blockbar) | 3 Runden | ★★☆☆☆ |
| SC-012 | sigaction() | 3 | Signal-Handler: Wenn du Schaden nimmst, reflect 50% | 5 Runden | ★★★☆☆ |
| SC-013 | pipe() | 2 | Pipeline: Nächste 2 Karten haben kombinierten Effekt | 3 Runden | ★★☆☆☆ |
| SC-014 | socket() | 3 | Netzwerk: Erhalte Karte aus zufälligem anderem Modul | 4 Runden | ★★★☆☆ |
| SC-015 | reboot() | 6 | Systemneustart: Reset Kampf, behalte Bugs, volles HP | Einmal pro Run | ★★★★★ |


---

## 8. KERNEL-MODULE (KLASSEN)

### 8.1 Basis-Module (Freigeschaltet)

#### netfilter.ko 🔥 Der Zerstörer
MODULE: netfilter.ko
TYPE: Packet Filter / Firewall
COMPLEXITY: ★★☆☆☆

"DROP everything. ACCEPT nothing."

PASSIVE: DROP_TABLE
→ Gegner verlieren 1 Rüstung/Runde

START_DECK:
[XOR_0xFF] x3  [DROP] x2  [REJECT] x2
[SYN_FLOOD] x1  [NOP_SLED] x2

SPECIAL_ABILITY: iptables -F
→ Einmal pro Run: Lösche alle Gegner-Buffs
  und füge 10 Schaden pro entferntem Buff zu

START_HP: 80 | START_CPU: 8 | HAND_SIZE: 5

---

#### ext4.ko 💾 Der Überlebende
MODULE: ext4.ko
TYPE: Journaling Filesystem
COMPLEXITY: ★★★☆☆

"Your data is safe. Probably."

PASSIVE: JOURNAL_MODE
→ Wenn du stirbst, behalte 50% deiner Bugs
  (statt 0%). Einmal pro Run.

START_DECK:
[fsck] x3  [BIT_MASK] x2  [CACHE_HIT] x2
[JOURNAL_COMMIT] x2  [INODE_RECOVER] x1

SPECIAL_ABILITY: resize2fs
→ Erhöhe deine Max-Leben um 10, aber
  verringere CPU-Zyklen/Runde um 1

START_HP: 120 | START_CPU: 6 | HAND_SIZE: 5

---

#### nvidia.ko 🎮 Der Parallel-Rechner
MODULE: nvidia.ko
TYPE: GPU Compute / CUDA
COMPLEXITY: ★★★★☆

"One core is never enough."

PASSIVE: CUDA_CORES
→ Du kannst 2 Karten/Runde spielen,
  aber die zweite kostet +2 CPU

START_DECK:
[CUDA_LAUNCH] x3  [THREAD_BLOCK] x2
[SHARED_MEM] x2  [GRID_SYNC] x2
[WARP_DIVERGENCE] x1

SPECIAL_ABILITY: nvcc -O3
→ Alle Karten in deiner Hand kosten
  diese Runde die Hälfte, aber nächste
  Runde kosten sie doppelt

START_HP: 90 | START_CPU: 10 | HAND_SIZE: 6

---

#### wireguard.ko 🔐 Der Infiltrator
MODULE: wireguard.ko
TYPE: VPN / Secure Tunnel
COMPLEXITY: ★★★★☆

"They can't hit what they can't see."

PASSIVE: STEALTH_MODE
→ Gegner können dich nicht targeten,
  wenn du auf 0x00 stehst

START_DECK:
[HANDSHAKE_INIT] x2  [EPHEMERAL_KEY] x2
[PFS_RENEW] x2  [TUNNEL_ESTABLISH] x2
[KEY_ROTATION] x1  [SIDECHANNEL_CLOSE] x1

SPECIAL_ABILITY: wg-quick up
→ Erstelle einen Tunnel zum Gegner:
  Du siehst seine nächsten 3 Züge und
  kannst eine Karte davon stehlen

START_HP: 100 | START_CPU: 7 | HAND_SIZE: 5

---

#### bpf.o ⚡ Der Chaot
MODULE: bpf.o
TYPE: Berkeley Packet Filter
COMPLEXITY: ★★★★★

"Undefined behavior is a feature."

PASSIVE: JIT_COMPILATION
→ Alle Karten haben randomisierte
  Effekte (±50% vom Basiswert)

START_DECK:
[BPF_PROG_LOAD] x2  [MAP_LOOKUP] x2
[VERIFIER_REJECT] x2  [KPROBE_ATTACH] x2
[TRACEPOINT] x1  [XDP_DROP] x1

SPECIAL_ABILITY: bpf_trace_printk
→ Zeige die nächsten 5 Karten deines
  Decks. Wähle eine: Sie kostet 0 und
  hat garantiert den MAX-Wert

START_HP: 85 | START_CPU: 9 | HAND_SIZE: 5

---

### 8.2 Freischaltbare Module

#### kvm.ko 🖥️ Der Hypervisor
MODULE: kvm.ko
TYPE: Hardware Virtualization
COMPLEXITY: ★★★★★

"Reality is just another VM."

PASSIVE: NESTED_VIRTUALIZATION
→ Du hast 2 "VMs" (Lebensbalken).
  Wenn eine VM stirbt, resete sie mit
  50% Leben, aber verliere alle Bugs

START_DECK:
[VM_CREATE] x2  [VCPU_RUN] x2
[MMIO_EXIT] x2  [IOAPIC_INJECT] x2
[VMEXIT_HANDLE] x1  [EPT_VIOLATION] x1

SPECIAL_ABILITY: vmcall
→ Wechsle in den "Root Mode":
  Du ignorierst alle Gegner-Effekte
  für 2 Runden, aber kannst nicht
  angreifen

START_HP: 110 | START_CPU: 8 | HAND_SIZE: 5
FREISCHALTUNG: 5 Runs abschließen

---

#### zfs.ko 🌊 Der Archivar
MODULE: zfs.ko
TYPE: Copy-on-Write Filesystem
COMPLEXITY: ★★★★☆

"Snapshots are forever."

PASSIVE: COPY_ON_WRITE
→ Wenn du eine Karte spielst, behalte
  eine "Snapshot"-Kopie im Deck (wird
  nach 3 Runden wieder gezogen)

START_DECK:
[ZPOOL_CREATE] x2  [SNAPSHOT] x3
[SEND_STREAM] x2  [RECEIVE] x2
[SCRUB] x1

SPECIAL_ABILITY: zfs rollback
→ Setze deinen Zustand auf den Anfang
  des Kampfes zurück (Leben, Hand,
  Position). Einmal pro Kampf.

START_HP: 130 | START_CPU: 5 | HAND_SIZE: 4
FREISCHALTUNG: 10 Runs abschließen

---

### 8.3 Modul-Balancing

| Modul | Start-HP | Start-CPU | Handgröße | Schwierigkeit | Stil |
|-------|----------|-----------|-----------|---------------|------|
| netfilter.ko | 80 | 8 | 5 | Leicht | Aggressiv |
| ext4.ko | 120 | 6 | 5 | Leicht | Defensiv |
| nvidia.ko | 90 | 10 | 6 | Mittel | Combo |
| wireguard.ko | 100 | 7 | 5 | Mittel | Kontrolle |
| bpf.o | 85 | 9 | 5 | Schwer | Riskant |
| kvm.ko | 110 | 8 | 5 | Schwer | Survival |
| zfs.ko | 130 | 5 | 4 | Schwer | Archivar |

---

## 9. GEGNER-BESTARIUM

### 9.1 ACT 1: USERLAND

#### cron.d ⏰ Der Zeitwächter
PROCESS: cron.d
PID: 0010  MEM: 32KB  PRIORITY: 19
HP: 60-80

"*/5 * * * * destroy_player"

PATTERN: SCHEDULED_TASKS
→ Jede 5. Runde führt cron eine
  "Task" aus (zufälliger starker Effekt)

ATTACKS:
[MINUTELY]  - 3 Schaden/Runde für 3 Rdn
[HOURLY]    - 15 Schaden sofort
[DAILY]     - Heile 20 Leben

WEAKNESS: SIGTERM
→ KILL -15-Karten fügen +50% Schaden

DROP: [CRONTAB] - Jede 3. Runde: +2 CPU-Zyklen

---

#### ssh-agent 🔑 Der Identitätsdieb
PROCESS: ssh-agent
PID: 0042  MEM: 128KB  PRIORITY: 0
HP: 80-100

"Your keys are my keys."

PATTERN: KEY_FORWARDING
→ Kopiert deine stärkste Karte jede
  4. Runde und spielt sie als eigene

ATTACKS:
[AGENT_FORWARD] - Stehle 1 zufällige Karte aus deiner Hand
[IDENTITY_ADD]  - Erhalte Buff = Wert der gestohlenen Karte

WEAKNESS: SSH_KILL
→ ssh-agent -k-Karte: Zerstöre ssh-agent,
  erhalte alle gestohlenen Karten zurück

DROP: [RSA_KEY] - Karten, die du kopierst, kosten -1 CPU

---

#### dockerd 🐳 Der Container-Tyrann
PROCESS: dockerd
PID: 0999  MEM: 512MB  PRIORITY: -10
HP: 100-120

"It works on my machine."

PATTERN: CONTAINER_ORCHESTRATION
→ Spawnt alle 3 Runden einen
  "container" (Mini-Gegner, 10 HP)

ATTACKS:
[PULL]      - Ziehe 2 zufällige Karten (aus deinem Deck!)
[RUN]       - Spiele eine gestohlene Karte sofort
[VOLUME_MOUNT] - Erhalte Rüstung = Anzahl Container x3

WEAKNESS: DOCKER_RM
→ docker rm -f-Karten zerstören alle Container sofort

DROP: [DOCKERFILE] - Speichere aktuelles Deck als Start-deck

---

### 9.2 ACT 2: KERNELSPACE

#### ksoftirqd ⚡ Der Interrupt-Dämon
PROCESS: ksoftirqd/0
PID: 0007  MEM: 0KB  PRIORITY: RT
HP: 100-140

"I interrupt. Therefore I am."

PATTERN: INTERRUPT_FLOOD
→ Jede Runde: 30% Chance, deine
  geplante Karte zu "interrupten"
  (wird stattdessen auf dich gewirkt)

ATTACKS:
[IRQ_BALANCE] - Verteile 5 Schaden auf alle deine Positionen
[SOFTIRQ_NET] - Stehle 2 CPU-Zyklen
[SOFTIRQ_BLOCK] - Du kannst nächste Runde nicht bewegen

WEAKNESS: NOHZ_FULL
→ echo 1 > /sys/kernel/...-Karte:
  Deaktiviere Interrupts für 3 Runden

DROP: [IRQ_AFFINITY] - Karten "pinnen" (nicht interruptbar)

---

#### oom_killer 💀 Der Speicher-Rächer
PROCESS: oom_killer
PID: ----  MEM: ∞  PRIORITY: RT+99
HP: 120-160

"Out of memory? Out of life."

PATTERN: MEMORY_PRESSURE
→ Dein "Speicher" (Handgröße) ist
  begrenzt auf 5 Karten. Jede Karte
  über 5 wird sofort "gekillt"

ATTACKS:
[BADNESS_HEURISTIC] - Berechne deine "Badness"
                        (je mehr Karten, desto mehr Schaden)
[SIGKILL] - INSTANT_DEATH wenn deine Hand > 7 Karten

WEAKNESS: OVERCOMMIT_MEMORY
→ echo 2 > ...-Karte: Du kannst unendlich Karten halten,
  aber jede über 5 kostet 2 Leben/Runde

DROP: [SWAP_PARTITION] - Handlimit +3, aber -5 Start-Leben

---

#### rcu_gp 🔄 Der Grace-Period-Geist
PROCESS: rcu_gp
PID: ----  MEM: 0KB  PRIORITY: RT
HP: ∞ (Grace Period System)

"I wait. I always wait."

PATTERN: GRACE_PERIOD
→ rcu_gp hat KEINE HP-Leiste!
  Stattdessen: "Grace Period Counter"
  Du musst 10 Runden überleben, dann
  stirbt er automatisch

ATTACKS:
[QUESCENT_STATE] - Erhalte 1 "Callback" (stapelbar Buff)
[INVOKE_CALLBACK] - Füge Schaden zu = Anzahl Callbacks x4
[STALL_WARNING] - Wenn du in 3 Runden nichts tust: 20 Schaden

WEAKNESS: RCU_BOOST
→ rcu_boost-Karten: Verkürze Grace Period um 2 Runden

DROP: [RCU_READ_LOCK] - Karten "quescieren" (aufschieben)

---

### 9.3 ACT 3: HARDWARE

#### mcelog 🔥 Der Hardware-Fehler
PROCESS: mcelog
PID: ----  MEM: ----  PRIORITY: ----
HP: 150-200

"Hardware does not forgive."

PATTERN: MACHINE_CHECK_EXCEPTION
→ Jede Runde: 10% Chance auf MCE
  (INSTANT 30 Schaden, nicht blockbar)

ATTACKS:
[THERMAL_TRIP] - Erhöhe "Temperatur"
                  (je höher, desto mehr Schaden/Runde)
[UNCORRECTED_ECC] - Zerstöre 1 zufällige Karte
                     PERMANENT aus deinem Deck!
[BUS_ERROR] - Du verlierst alle CPU-Zyklen diese Runde

WEAKNESS: EDAC
→ edac-util-Karten: Heile zerstörte Karten,
  verringere Temperatur

DROP: [ECC_MEMORY] - Karten können nicht mehr permanent
      zerstört werden (nur temporär)

---

#### intel_pstate 📉 Der Drossler
PROCESS: intel_pstate
PID: ----  MEM: ----  PRIORITY: ----
HP: 140-180

"Performance is a privilege."

PATTERN: THERMAL_THROTTLING
→ Deine CPU-Zyklen werden jede Runde
  um 1 reduziert (Minimum: 1)

ATTACKS:
[PSTATE_MIN] - Setze deine CPU auf 1 für 2 Runden
[TURBO_DISABLE] - Du kannst keine "Turbo"-Karten mehr spielen
[HWP_DYNAMIC] - Wechsel zwischen "High Power" und "Low Power"

WEAKNESS: MSR_IA32_MISC_ENABLE
→ wrmsr-Karten: Deaktiviere Throttling für 3 Runden

DROP: [PERFORMANCE_GOVERNOR] - CPU regeneriert +1/Runde statt -1

---

## 10. BOSS-KÄMPFE

### 10.1 ACT 1 BOSS: systemd 🐙

BOSS: systemd
HP: 500
PHASES: 3

"I am PID 1. I am everything. I am inevitable."

PHASE 1 (HP > 350): FORK_BOMB
→ Spawnt alle 2 Runden einen systemd-service
  (20 HP, greift mit 5 Schaden an)
→ Services können nicht gezielt werden (nur AOE)

PHASE 2 (HP 150-350): SOCKET_ACTIVATION
→ Erstellt "Sockets" auf dem Feld
  (Wenn du drauf trittst: 15 Schaden + Stun)
→ systemd heilt 10 HP pro Socket, das du triggst

PHASE 3 (HP < 150): EMERGENCY_MODE
→ Alle deine Karten kosten +2 CPU
→ systemd greift 2x pro Runde an
→ Wenn er stirbt: systemctl reboot (10 Schaden AOE)

WEAKNESS: SIGPWR
→ kill -PWR-Karten: Deaktiviere aktuelle Phase für 2 Runden

DROP: [UNIT_FILE] - Starte "Services" (permanente Begleiter)

---

### 10.2 ACT 2 BOSS: kernel_panic 💥

BOSS: kernel_panic
HP: 800
PHASES: 2 (dynamisch)

"Kernel panic - not syncing: VFS: Unable to mount root fs"

BESONDERHEIT: KEINE FESTE PHASES!
→ kernel_panic reagiert auf deine Aktionen:

WENN DU VIELE KARTEN SPIELST:
  [OOPS] - Stack trace: Zeigt deine letzten 3 Karten an
           und kopiert sie (spielt sie gegen dich)

WENN DU WENIG KARTEN SPIELST:
  [HUNG_TASK] - Timeout: Du verlierst 5 HP/Runde bis du
                 wieder eine Karte spielst

WENN DU VIEL BEWEGST:
  [PAGE_FAULT] - Segfault auf deiner Position: 20 Schaden

WENN DU STILLSTEHST:
  [WATCHDOG] - Soft lockup detected: 15 Schaden/Runde

WEAKNESS: KEXEC
→ kexec-Karte: Starte neuen Kernel (Reset des Kampfes,
  aber behalte deine Bugs)

DROP: [KDB] - Debug-Modus: Zeige Quellcode des nächsten Gegners

---

### 10.3 FINAL BOSS: /sbin/init 👁️

BOSS: /sbin/init
HP: ∞ (Mechanik-Kampf)

"I am the beginning. I am the end. I am PID 1."

DAS SPIELFELD:
Ein 8x8 Hex-Gitter. In der Mitte: init (unbeweglich)
An den Rändern: 4 "Runlevel-Ports" (0, 3, 5, 6)

SIEG-BEDINGUNG:
1. Fülle deinen STACK mit genau 64 NOP-Karten
2. Spiele SHELLCODE auf init
3. Überschreibe den RETURN_POINTER mit 0x41414141

WAS INIT TUT:
→ Jede Runde: kill -9 auf eine zufällige Position
  (INSTANT_DEATH wenn du dort stehst)
→ Alle 3 Runden: fork() - Erstellt Kopie von sich
  (Kopien haben 100 HP, müssen auch besiegt werden)
→ Wenn du SHELLCODE spielst ohne 64 NOPs:
  Segmentation fault - Du stirbst INSTANT

RUNLEVEL-PORTS:
[0] HALT    - Beende Kampf sofort (Flucht, kein Sieg)
[3] MULTI   - +2 CPU/Runde, aber +1 init-Angriff/Runde
[5] GRAPHIC - Sieh init's nächsten Zug (sonst hidden)
[6] REBOOT  - Reset Kampf, behalte aber STACK

NACH DEM SIEG:
root@null_pointer:~# _
Du bist ROOT. Das System gehört dir.
NEW GAME+ freigeschaltet.

---

## 11. EVENTS

### 11.1 Kampf-Events (zwischen Kämpfen)

#### fsck 🔧
"Filesystem check in progress..."

[A] fsck -y  (Repariere: Bezahle 20 Bugs,
    entferne 2 schwache Karten)
[B] fsck -n  (Ignoriere: -10 Max-Leben
    für nächsten Kampf)
[C] mkfs.ext4 (Formatiere: Verliere HALB dein Deck,
    erhalte 5 zufällige RARE+ Karten)

---

#### apt update 📦
"47 packages can be upgraded."

[A] apt upgrade (Tausche 3 Karten gegen höhere
    Seltenheit, -15 Bugs)
[B] apt dist-upgrade (Tausche 5 Karten, aber 1 wird
    zu zufälliger Seltenheit, -25 Bugs)
[C] apt autoremove (Entferne 3 schwache Karten, +10 Bugs)

---

#### core dump 💾
"/var/crash/segment_0x7A3F.core"

[A] gdb core (Analysiere: Erhalte Info über
    nächsten Gegner + 5 Bugs)
[B] strings core (Extrahiere: Erhalte 1 zufällige
    Karte aus deinem letzten Run)
[C] rm core (Lösche: +15 Bugs, aber nächster
    Gegner hat +20% HP)

---

#### dmesg 📋
"[  +5.772100] segfault at 0x41414141"

[A] grep segfault (Fokus: Nächster Gegner hat -10% HP)
[B] grep usb (Ignore: Erhalte [USB_DEVICE]: +1 Karte/Runde)
[C] tail -f (Warte: Überspringe Event, aber +20 Bugs)

---

#### modprobe 🔌
"Module 0xBAD_C0DE wants to load."

[A] modprobe --force (50%: Legendäre Karte,
    50%: Boss-Kampf sofort)
[B] modprobe --dry-run (Info: Sieh Karte,
    aber nicht nehmen, +5 Bugs)
[C] echo blacklist > ... (Sicher: +15 Bugs,
    nie wieder dieses Event)

---

#### strace 🔍
"You found a mysterious process."

[A] strace -p ???? (Verfolge: Sieh 3 zukünftige
    Events vorab)
[B] kill -9 ???? (Terminiere: Erhalte 30 Bugs,
    aber überspringe nächsten Shop)
[C] cat /proc/????/cmdline (Lese: Erhalte Hinweis
    auf Secret-Boss)

---

#### crontab -e ⏰
"Edit your scheduled tasks."

[A] */5 * * * * heal (Jeder 5. Kampf: Starte mit +10 Leben)
[B] 0 0 * * * loot (Täglich: +50 Bugs,
    aber nur wenn du täglich spielst)
[C] @reboot buff (Starte jeden Run mit +2 CPU,
    aber -5 Start-Leben)

---

#### git merge 🔀
"CONFLICT in deck.conf"

[A] git checkout --ours (Behalte aktuelle Karte,
    verliere andere)
[B] git checkout --theirs (Nehme andere Karte,
    verliere aktuelle)
[C] git merge --abort (Beide behalten,
    aber -10 Max-Leben permanent)

---

#### tcpdump 🕵️
"Capturing traffic on interface eth0..."

[A] tcpdump -i eth0 (Lausche: Nächster Shop hat 50% Rabatt)
[B] tcpdump -w capture.pcap (Speichere: Erhalte
    [PACKET_CAPTURE]: Zeige Gegner-Hand)
[C] tcpdump -X (Hex-Dump: Erhalte zufällige Karte,
    aber verschlüsselt [ENCRYPTED_???])

---

#### valgrind 🧹
"LEAK SUMMARY: definitely lost: 3 cards"

[A] valgrind --leak-check=full (Fix: Entferne 3
    schwache Karten, +20 Bugs)
[B] valgrind --show-leak-kinds=all (Ignoriere:
    Behalte Karten, aber -2 CPU/Runde permanent)
[C] echo "it's fine" (Leugne: +10 Bugs,
    aber 10% Chance auf Crash pro Kampf)

---

#### man page 📖
"NAME: systemd - system and service manager"

[A] man -k weakness (Suche: Zeige Schwäche des
    nächsten Gegners)
[B] man -P cat (Raw: Erhalte [DOCUMENTATION]:
    +5% Schaden gegen dokumentierte Gegner)
[C] q (Quit: +5 Bugs, nichts sonst)

---

#### chmod 🔐
"-rwsr-xr-x 1 root root exploit.bin"

[A] chmod +x exploit.bin (Ausführen: Erhalte
    zufälliges EXPLOIT, aber 25% Chance auf [ROOTKIT])
[B] chmod 000 exploit.bin (Sperren: +15 Bugs,
    nie wieder dieses Event)
[C] ./exploit.bin (Riskant: 50% Legendäre Karte,
    50% INSTANT_DEATH)

---

#### env 🌍
"SECRET_FLAG=0x1337H4X0R"

[A] export PATH=$PATH:/opt (Erweitere: Shops haben
    +1 Karte-Auswahl)
[B] echo $SECRET_FLAG (Nutze: Erhalte [0x1337H4X0R]
    - INSTANT_KILL gegen normale Gegner, einmalig)
[C] unset SECRET_FLAG (Lösche: +30 Bugs,
    aber Secret-Boss wird schwieriger)

---

#### ping 📡
"PING unknown.host (???): 64 bytes from ???"

[A] ping -c 1 (Kurz: Erhalte Info über Secret-Area)
[B] ping -f (Flood: Erhalte 5 zufällige Karten,
    aber -10 Leben)
[C] ping -i 0.2 (Schnell: Überspringe nächsten Kampf,
    aber auch dessen Belohnung)

---

#### tar 📦
"You found an archive: old_run.tar.gz"

[A] tar -xzf (Extrahiere: Erhalte komplettes Deck
    von vor 3 Runs)
[B] tar -tzf (Inhalte: Sieh Deck, wähle 1 Karte davon)
[C] tar -czf backup.tar.gz (Backup: Speichere
    aktuelles Deck für späteren Run, -5 Handplatz)

---

#### watch 👁️
"Every 2.0s: ps aux | grep player"

[A] watch -n 1 (Schnell: Erhalte [REALTIME]:
    Sieh Gegner-Züge in ECHTZEIT)
[B] Ctrl+C (Beenden: +10 Bugs, aber nächster
    Kampf startet sofort)
[C] watch -d (Differenz: Erhalte [DIFF_MODE]:
    Zeige nur geänderte Gegner-Stats)

---

#### dd 💿
"You found a block device. /dev/sda - 500GB"

[A] dd if=/dev/zero (Lösche: Entferne ALLE Karten,
    erhalte 100 Bugs)
[B] dd if=/dev/random (Random: Erhalte 10 zufällige
    Karten, aber 3 sind [CORRUPTED])
[C] dd if=/dev/urandom (Fast: Erhalte 5 zufällige
    Karten, 1 ist garantiert LEGENDARY)

---

#### journalctl 📰
"System logs available."

[A] journalctl -u player.service (Deine Logs:
    Erhalte Statistik über deinen besten Run)
[B] journalctl -f (Live: Erhalte [LIVE_LOG]:
    Schaden wird angezeigt BEVOR er passiert)
[C] journalctl --vacuum-time=1d (Aufräumen: +20 Bugs,
    aber verliere alle "Snapshot"-Effekte)

---

#### make 🔨
"Makefile found in current directory."

[A] make (Kompiliere: Erhalte [COMPILED]: +10% Schaden
    für alle Karten diese Runde)
[B] make clean (Säubern: Entferne alle temporären
    Buffs, +15 Bugs)
[C] make -j$(nproc) (Parallel: Spiele nächsten Kampf
    mit doppelter Geschwindigkeit, aber halbierte Belohnung)


---

## 12. ROGUELITE-SYSTEME

### 12.1 Der Bootloader (HUB zwischen Runs)

Nach jedem Tod (oder Sieg) landest du im Bootloader:

BOOTLOADER v3.14
================

[1] KERNEL_PANIC_LOG (Analyse)
[2] MODPROBE (Neue Module)
[3] FSCK (Deck optimieren)
[4] REBOOT (Neuer Run)

Verfügbare Module: 0x0A
Gesammelte Bugs: 47

### 12.2 Bug-Bounty-System

Statt Gold sammelst du BUGS (🐛). Jeder Run generiert zufällige Bug-Reports.

| Bug-Typ | Debuff während Run | Upgrade nach Run |
|---------|-------------------|------------------|
| SEGFAULT 🐛 | 10% Crash pro Karte | +5% Crit für SEG_FAULT-Karten |
| RACE_COND 🐛 | Gegner spielt manchmal vor dir | RACE_CONDITION spielt 3 statt 2 |
| MEM_LEAK 🐛 | -1 Leben/Runde | MEMORY_LEAK kostet keine Leben |
| OFF_BY_ONE 🐛 | ±1 variierende Effekte | Karten mit "1" kosten -1 CPU |
| HEISENBUG 🦋 | Zufälliger Effekt jede Runde | Zufällige Karte gratis/Runde |

### 12.3 Tägliche Herausforderungen
- "Heute nur Schokolade essen!" (Nur bestimmte Kartentypen)
- "Überlebe 2 Minuten ohne zu verdauen" (Keine Heilung)
- "Erreiche Gewicht 100 und gewinne trotzdem" (Schwierigkeits-Challenge)

### 12.4 Meta-Progression

Nach jedem Run sammelst du Zucker-Kristalle (Bugs):
- Neue Fluff-Skins: Goldener Fluff, Galaxy-Fluff, Pixel-Fluff
- Passive Fähigkeiten:
  - "Hohlzahn": Bonbons zählen doppelt, aber Kuchen gibt keine Punkte
  - "Metabolismus": Gewicht verliert sich 20% schneller
  - "Zuckerkruste": Du nimmst 10% weniger Schaden vom Tellerrand
- Welt-Mods: Nachtmodus (nur Schatten), Spiegelmodus (Steuerung invertiert)

---

## 13. BALANCING & MATHEMATIK

### 13.1 Grundformeln

Durchschnittlicher Schaden pro Runde (DPS) = (Karten-DMG x Trefferquote) / Runden
Ziel-DPS für Spieler (Act 1): 8-12 pro Runde
Ziel-DPS für Spieler (Act 2): 12-18 pro Runde
Ziel-DPS für Spieler (Act 3): 18-25 pro Runde

CPU-Effizienz = Effekt / Kosten
Ziel-Effizienz COMMON: 2.5-3.5
Ziel-Effizienz UNCOMMON: 3.5-5.0
Ziel-Effizienz RARE: 5.0-7.5
Ziel-Effizienz EPIC: 7.5-12.0
Ziel-Effizienz LEGENDARY: 12.0-20.0

Gegner-HP-Berechnung:
Act 1 Normal: 60-100 HP (5-8 Runden Kampf)
Act 1 Boss: 300-500 HP (10-15 Runden)
Act 2 Normal: 100-180 HP
Act 2 Boss: 500-800 HP
Act 3 Normal: 150-250 HP
Act 3 Boss: 800-1200 HP
Final Boss: ∞ (Mechanik-Kampf)

### 13.2 Seltenheits-Wahrscheinlichkeiten

| Seltenheit | Drop-Rate | Shop-Kosten |
|------------|-----------|-------------|
| COMMON | 60% | 10-20 Bugs |
| UNCOMMON | 25% | 25-40 Bugs |
| RARE | 10% | 50-80 Bugs |
| EPIC | 4% | 100-150 Bugs |
| LEGENDARY | 1% | 250-400 Bugs |

### 13.3 Modul-Balancing

| Modul | Start-HP | Start-CPU | Handgröße | Schwierigkeit |
|-------|----------|-----------|-----------|---------------|
| netfilter.ko | 80 | 8 | 5 | Leicht |
| ext4.ko | 120 | 6 | 5 | Leicht |
| nvidia.ko | 90 | 10 | 6 | Mittel |
| wireguard.ko | 100 | 7 | 5 | Mittel |
| bpf.o | 85 | 9 | 5 | Schwer |
| kvm.ko | 110 | 8 | 5 | Schwer |
| zfs.ko | 130 | 5 | 4 | Schwer |

---

## 14. UI/UX DESIGN

### 14.1 Startmenü

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    ║
║     ░  ██╗  ██╗██╗   ██╗██╗     ██╗      ██████╗ ██╗   ██╗ ░    ║
║     ░  ██║  ██║██║   ██║██║     ██║     ██╔═══██╗╚██╗ ██╔╝ ░    ║
║     ░  ███████║██║   ██║██║     ██║     ██║   ██║ ╚████╔╝  ░    ║
║     ░  ██╔══██║██║   ██║██║     ██║     ██║   ██║  ╚██╔╝   ░    ║
║     ░  ██║  ██║╚██████╔╝███████╗███████╗╚██████╔╝   ██║    ░    ║
║     ░  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝ ╚═════╝    ╚═╝    ░    ║
║     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    ║
║                                                              ║
║              [P.O.I.N.T.E.R.  I.N.I.T.I.A.L.I.Z.E.D.]       ║
║                                                              ║
║     ┌────────────────────────────────────────────────┐      ║
║     │                                                │      ║
║     │  > BOOT_KERNEL() .................... [ENTER]  │      ║
║     │                                                │      ║
║     │  > LOAD_MODULE(continue) .......... [CONTINUE] │      ║
║     │     [Last session: PID_0x7A3F - ACT_2]         │      ║
║     │                                                │      ║
║     │  > INSPECT_DUMPCORE(stats) ......... [STATS]   │      ║
║     │                                                │      ║
║     │  > CONFIGURE_SYSCONFIG(options) .... [CONFIG]  │      ║
║     │                                                │      ║
║     │  > TERMINATE_PROCESS(quit) ......... [QUIT]    │      ║
║     │                                                │      ║
║     └────────────────────────────────────────────────┘      ║
║                                                              ║
║     v2.0.47-stable | Build: 0xDEADBEEF | Uptime: 4,294,967,295s ║
║                                                              ║
║     [█░░░░░░░░░░░░░░░░░░] Memory: 64KB / 64MB               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

### 14.2 Ladebildschirm

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     [NULL_POINTER] Initializing...                           ║
║                                                              ║
║     > Loading kernel modules...        [OK]                  ║
║     > Mounting filesystems...          [OK]                  ║
║     > Starting network services...     [WARN]                ║
║     > Detecting hardware...            [OK]                  ║
║     > Allocating memory heap...        [OK]                  ║
║     > WARNING: Segmentation fault in module 0xBAD_C0DE       ║
║     > Attempting recovery...           [FAIL]                ║
║     > Continuing with corrupted state...                     ║
║                                                              ║
║     [████████████████████░░░░░░░░░░] 67%                     ║
║                                                              ║
║     Tip: Use NOP_SLED to buffer against unexpected jumps     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

### 14.3 Kampf-Screen

╔══════════════════════════════════════════════════════════════╗
║  [SYS] Uptime: 00:04:23  |  Load: 0.42  |  Mem: 47%         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  GEGNER: systemd [PID:0001]  HP:[████████░░░░░░░░░░] 340/500 ║
║  Buffs: [FORK_BOMB] [SOCKET_ACT]                             ║
║                                                              ║
║         0x00 ── 0x01 ── 0x02 ── 0x03                        ║
║        /  \    /  \    /  \    /  \                          ║
║      0x10 ── 0x11 ── 🐙 ── 0x13 ── 0x14                     ║
║        \  /    \  /    \  /    \  /                          ║
║      0x20 ── 0x21 ── 👤 ── 0x23 ── 0x24                     ║
║                                                              ║
║  DU: Segment_0x00 [netfilter.ko]  HP:[████████████░░] 78/100 ║
║  CPU: [██████░░░░] 6/10  |  Stack: [0xA1][0xB2]              ║
║  Position: 0x22  |  Bugs: 47  |  Rüstung: 3                 ║
║                                                              ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        ║
║  │XOR_0xFF  │ │NOP_SLED  │ │DROP      │ │fsck      │        ║
║  │  0xFF^💀 │ │ 90 90 90 │ │   🔥     │ │   🔧     │        ║
║  │ COST: 3  │ │ COST: 2  │ │ COST: 2  │ │ COST: 1  │        ║
║  │ DMG: 8   │ │ +2 CPU   │ │ -1 Rüstg │ │ +5 HP    │        ║
║  └──────────┘ └──────────┘ └──────────┘ └──────────┘        ║
║                                                              ║
║  [1] [2] [3] [4] [5] [SPACE: End Turn]  [Q: Quit]           ║
╚══════════════════════════════════════════════════════════════╝

### 14.4 Game Over Screen

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     [████ KERNEL PANIC ████]                                ║
║                                                              ║
║     Segment_0x00 has been terminated.                       ║
║                                                              ║
║     Signal: SIGSEGV (11)                                    ║
║     Fault Address: 0x00000000                               ║
║     Instruction Pointer: 0x00401337                         ║
║                                                              ║
║     Stack Trace:                                            ║
║     #0  0x00401337 in main ()                               ║
║     #1  0x00401200 in combat_loop ()                        ║
║     #2  0x00401050 in execute_card ()                       ║
║                                                              ║
║     Register Dump:                                          ║
║     EAX: 0x00000000  EBX: 0xDEADBEEF                       ║
║     ECX: 0x00000047  EDX: 0x00000000  ← You are here       ║
║                                                              ║
║     ┌────────────────────────────────────────────────┐      ║
║     │  Run Statistics:                               │      ║
║     │  - Duration: 00:04:23                          │      ║
║     │  - Kills: 12                                   │      ║
║     │  - Bugs Collected: 47                          │      ║
║     │  - Cards Played: 89                            │      ║
║     │  - Favorite Card: NOP_SLED (23x)               │      ║
║     │  - Cause of Death: oom_killer (SIGKILL)        │      ║
║     └────────────────────────────────────────────────┘      ║
║                                                              ║
║     [R] REBOOT  |  [S] SAVE DUMP  |  [Q] QUIT              ║
║                                                              ║
║     Tip: Use "vm.overcommit_memory=1" for risky plays      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

### 14.5 Responsive Design

Desktop (≥1024px): Volles Hex-Gitter, alle Infos sichtbar
Tablet (768-1023px): Karten horizontal scrollbar, kompaktes Grid
Mobile (<768px): Vertikale Karten-Liste, vereinfachtes Grid (3x3 statt 4x4)

---

## 15. SOUND-DESIGN

### 15.1 Web Audio API Synthesizer

Karten spielen: Tastatur-Klick + kurzer Modem-Dialup-Ton
Schaden: 8-Bit-Explosion + "Segmentation fault (core dumped)"-Voice line
Boss: Tiefes Dröhnen + sudo Passwort-Prompt-Sound
Musik: Synthwave mit eingestreuten beep-Befehlen aus Linux

### 15.2 Sound-Effekte Spezifikation

8-Bit Explosion:
- Oscillator: sawtooth
- Frequenz: 200Hz → 50Hz (exponential)
- Gain: 0.5 → 0.01 (exponential)
- Dauer: 0.3s

Karten-Klick:
- Oscillator: square
- Frequenz: 800Hz → 1200Hz
- Gain: 0.3 → 0.01
- Dauer: 0.1s

Schaden-Glitch:
- Buffer: Random noise (sampleRate * 0.2)
- Filter: Bandpass 1000Hz, Q=10
- Gain: 0.4 → 0.01
- Dauer: 0.2s

---

## 16. EASTER EGGS & SECRETS

### 16.1 Bekannte Easter Eggs

- 0xCAFEBABE + 0xDEADBEEF + 0xBAADF00D in einem Zug:
  → 0x1337H4X0R erscheint (INSTANT_KILL gegen normale Gegner)

- Gegner emacs hat doppelt so viel HP wie vim,
  aber vim-Karten fügen ihm doppelten Schaden zu (Editor-War)

- 47 Mal sterben:
  → "It's not a bug, it's a feature."
  → FEATURE_FLAG-Modus freigeschaltet (alles invertiert)

### 16.2 Secret-Bosses

- Secret-Boss: microcode.ko (freigeschaltet nach allen Modulen max level)
- Secret-Area: Erreichbar nur mit bestimmten Event-Kombinationen

---

## 17. FREISCHALTSYSTEM

| Bedingung | Freischaltung |
|-----------|--------------|
| 1 Run abschließen | bpf.o Modul |
| 5 Runs abschließen | kvm.ko Modul |
| 10 Runs abschließen | zfs.ko Modul |
| systemd besiegen | UNIT_FILE Karten-Mechanik |
| kernel_panic besiegen | KDB Debug-Modus |
| /sbin/init besiegen | NEW GAME+ |
| Alle Module max level | microcode.ko (Secret-Modul) |
| 47 Bugs sammeln in einem Run | 0x1337H4X0R Karte |
| Sterben an SIGKILL 10x | SIG_IGN Passive |
| Keine Karte spielen für 5 Runden | IDLE_PROCESS Titel |

---

## 18. TECHNISCHE UMSETZUNG

### 18.1 Empfohlener Tech-Stack

EMPFEHLUNG: PixiJS + Vite + TypeScript

Frontend:    PixiJS (WebGL-Renderer für Partikel/CRT-Effekte)
UI-Overlay:  HTML/CSS (für Karten, Stats, Menüs)
State:       XState oder Custom Event-Driven
Audio:       Web Audio API (procedural, kein Download)
RNG:         seedrandom (für deterministische Replays)
Build:       Vite (Hot Reload, schnelles Bundling)
Storage:     localStorage + IndexedDB
Tests:       Vitest
Hosting:     GitHub Pages (kostenlos)

### 18.2 Alternative Optionen

Option A: Vanilla JS + HTML5 Canvas
- Pro: Maximale Kontrolle, kein Overhead, leicht zu hosten
- Con: Alles selbst bauen, keine vorgefertigten Systeme

Option B: Phaser 3
- Pro: Reife Engine, gute Performance, viele Beispiele
- Con: Overhead für ein Kartenspiel, lernt manchmal gegen die Engine an

Option C: PixiJS + eigene Logik (EMPFOHLEN)
- Pro: Beste Performance für Partikel-Effekte, flexibel
- Con: Mehr Setup-Arbeit als Phaser

### 18.3 Dependencies

{
  "dependencies": {
    "pixi.js": "^7.3.0",
    "xstate": "^4.38.0",
    "howler": "^2.2.3",
    "seedrandom": "^3.0.5"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "vite": "^4.4.0",
    "vitest": "^0.34.0",
    "@types/howler": "^2.2.8"
  }
}

### 18.4 Projekt-Struktur

null-pointer/
├── src/
│   ├── core/
│   │   ├── Game.ts              # Hauptspiel-Loop
│   │   ├── StateManager.ts      # Zustandsverwaltung
│   │   ├── EventBus.ts          # Event-System
│   │   └── RNG.ts               # Seeded Random
│   ├── renderer/
│   │   ├── PixiRenderer.ts      # PixiJS Setup
│   │   ├── HexGrid.ts           # Hex-Gitter Rendering
│   │   ├── CardRenderer.ts      # Karten-Visuals
│   │   ├── ParticleSystem.ts    # Bit-Flip, Explosionen
│   │   └── CRTEffect.ts         # Scanlines, Glitch
│   ├── game/
│   │   ├── combat/
│   │   │   ├── CombatSystem.ts  # Kampf-Logik
│   │   │   ├── TurnManager.ts   # Runden-Verwaltung
│   │   │   └── AIModel.ts       # Gegner-AI
│   │   ├── cards/
│   │   │   ├── Card.ts          # Basis-Karten-Klasse
│   │   │   ├── CardEffect.ts    # Effekt-Engine
│   │   │   ├── CardLibrary.ts   # Alle 150 Karten
│   │   │   └── DeckBuilder.ts   # Deck-Management
│   │   ├── entities/
│   │   │   ├── Player.ts        # Spieler-Entität
│   │   │   ├── Enemy.ts         # Gegner-Entität
│   │   │   └── Boss.ts          # Boss-Spezial
│   │   └── grid/
│   │       ├── HexGrid.ts       # Hex-Grid Logik
│   │       ├── Position.ts      # Positions-System
│   │       └── ZoneEffects.ts   # Feld-Effekte
│   ├── ui/
│   │   ├── HUD.ts               # Heads-Up Display
│   │   ├── CardHand.ts          # Hand-Visualisierung
│   │   ├── StartMenu.ts         # Startmenü
│   │   ├── EventModal.ts        # Event-Dialoge
│   │   └── GameOver.ts          # Game Over Screen
│   ├── data/
│   │   ├── cards.json           # Karten-Definitionen
│   │   ├── enemies.json         # Gegner-Definitionen
│   │   ├── events.json          # Event-Definitionen
│   │   └── modules.json         # Modul-Definitionen
│   ├── audio/
│   │   ├── SoundManager.ts      # Web Audio API
│   │   ├── SynthEngine.ts       # Synthesizer
│   │   └── VoiceSynthesizer.ts  # Text-to-Speech (optional)
│   └── utils/
│       ├── HexMath.ts           # Hexagon-Mathematik
│       ├── BitOperations.ts     # Bitwise-Operationen
│       └── Storage.ts           # localStorage/IndexedDB
├── assets/
│   ├── fonts/                   # VT323, Fira Code
│   ├── sprites/                 # ASCII-Sprites (generiert)
│   ├── audio/                   # Synthesizer-Presets
│   └── shaders/                 # CRT/Glitch Shader
├── public/
│   └── index.html
├── tests/
│   ├── combat.test.ts
│   ├── cards.test.ts
│   └── balance.test.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md

### 18.5 Performance-Budget

Ziel: 60 FPS auf Mid-Range Laptop (i5, integrated GPU)

Canvas-Elemente:
- Hex-Grid: 16 Felder, 1 Drawcall pro Feld = 16 Drawcalls
- Karten: Max 10 gleichzeitig, 1 Drawcall pro Karte = 10 Drawcalls
- Partikel: Max 100 gleichzeitig, batched = 1 Drawcall
- UI: HTML/CSS Overlay (kein Canvas)

Speicher:
- Karten-Assets: Generiert aus JSON (keine Bilder)
- Audio: Procedural (keine Dateien)
- Gesamt: <10MB

CPU:
- Kampf-Logik: <1ms pro Frame
- Pfadfindung: Nur bei Bewegung (A* cached)
- Effekt-Berechnung: Nur bei Karten-Spiel

### 18.6 Testing-Strategie

Unit-Tests (Vitest):
- Karten-Effekte: Jede Karte einzeln testen
- Hex-Grid: Pfadfindung, Distanzen
- Kampf-Logik: Runden, Schaden, Heilung
- RNG: Determinismus, Verteilung

Integration-Tests:
- Kompletter Kampf: Spieler vs. Gegner
- Deck-Building: Karten hinzufügen/entfernen
- Progression: Bugs sammeln, Freischaltungen

Balance-Tests:
- Simuliere 1000 Kämpfe pro Gegner
- Prüfe durchschnittliche Runden-Anzahl
- Prüfe Win-Rate pro Modul

Playtests:
- Woche 4: Intern (3-5 Personen)
- Woche 6: Freunde (10-15 Personen)
- Woche 8: Öffentliche Beta (Reddit, Discord)

### 18.7 Deployment

Hosting: GitHub Pages (kostenlos, schnell)
Domain: null-pointer.io (oder GitHub Pages Subdomain)
CDN: jsDelivr für Dependencies (optional)
Analytics: Plausible (privacy-friendly, optional)

Build-Prozess:
1. npm run build (Vite produziert dist/)
2. GitHub Action deployt zu gh-pages Branch
3. Live in <2 Minuten

Updates:
- Semantic Versioning (v1.0.0, v1.1.0)
- Changelog in GitHub Releases
- Auto-Update-Hinweis im Spiel

---

## 19. IMPLEMENTIERUNGSPLAN

### PHASE 1: PROTOTYP (Woche 1-2)
Ziel: Spielbarer Kampf-Loop

Tag 1-2: Projekt-Setup, Canvas-Renderer, ASCII-Sprite-System
Tag 3-4: Hex-Grid-Implementierung, Bewegungs-Logik
Tag 5-6: Karten-System (ziehen, spielen, Effekte)
Tag 7-8: Kampf-Loop (Runden, Gegner-AI, Schaden)
Tag 9-10: Basis-UI (HP, CPU, Stack, Heap-Anzeige)
Tag 11-14: 20 Karten implementieren, 3 Gegner, Balancing-Tests

### PHASE 2: KERNSPIEL (Woche 3-4)
Ziel: Kompletter Act 1 spielbar

Woche 3:
- Alle 60 OPCODES implementieren
- Karten-Effekt-Engine (modular, JSON-basiert)
- Gegner-Bestarium (cron.d, ssh-agent, dockerd)
- Boss: systemd
- Event-System (fsck, apt, modprobe)
- Deckbuilding zwischen Kämpfen

Woche 4:
- 7 Kernel-Module (Klassen)
- Progression-System (Bugs, Freischaltungen)
- Speicher-System (localStorage)
- Sound-System (Web Audio API)
- CRT-Effekt, Partikel-System

### PHASE 3: CONTENT (Woche 5-6)
Ziel: Alle 3 Acts + Final Boss

Woche 5:
- Act 2 Gegner (ksoftirqd, oom_killer, rcu_gp)
- Act 3 Gegner (mcelog, intel_pstate)
- Boss: kernel_panic
- 45 DATA_PACKETS
- 30 EXPLOITS

Woche 6:
- Final Boss: /sbin/init
- NEW GAME+ Modus
- Alle 20 Events
- Secret-Bosses, Easter Eggs
- Komplettes Balancing

### PHASE 4: POLISH (Woche 7-8)
Ziel: Release-Ready

Woche 7:
- Animationen (Karten-Flip, Schaden-Float, Screen-Shake)
- Sound-Design (Synthesizer-Sounds, Voice-Lines)
- Responsive Design (Mobile, Tablet)
- Performance-Optimierung
- Speicher-Management (IndexedDB für Replays)

Woche 8:
- Tutorial-System
- Achievements
- Leaderboard (optional: Firebase)
- Bug-Fixing
- Beta-Test mit Freunden

### ZEITPLAN ZUSAMMENFASSUNG

| Phase | Wochen | Ziel | Deliverable |
|-------|--------|------|-------------|
| 1 | 1-2 | Prototyp | Spielbarer Kampf, 20 Karten, 3 Gegner |
| 2 | 3-4 | Kernspiel | Act 1 komplett, 7 Module, Boss |
| 3 | 5-6 | Content | Alle 3 Acts, 150 Karten, Final Boss |
| 4 | 7-8 | Polish | Release-Ready, Sound, Animationen |

Gesamt: 8 Wochen für MVP
+2 Wochen Puffer für Bug-Fixing
= 10 Wochen bis Release

---

## 20. GLOSSAR

| Begriff | Bedeutung im Spiel |
|---------|-------------------|
| PID | Process ID, dein Level/Fortschritt |
| CPU | Mana-System für Karten |
| Stack | Temporäre Buffs (LIFO) |
| Heap | Permanente Modifikationen (FIFO) |
| Bug | Währung + Debuff + Upgrade |
| NOP | No Operation, +1 CPU |
| SIGKILL | Unblockierbarer Tod |
| SEGFAULT | Speicherzugriffsfehler |
| CVE | Common Vulnerability and Exposure (Exploit-Karten) |
| Magic Number | Bekannte Hex-Werte mit Bedeutung |
| Root | Ziel: PID 1 werden |
| Run | Ein kompletter Durchlauf |
| Act | Kapitel (3 Acts + Final) |

---

*"It's not a bug, it's a feature."*
*— NULL_POINTER Development Team*

*END OF DOCUMENT*
