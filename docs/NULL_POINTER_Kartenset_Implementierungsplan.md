
# NULL_POINTER v3.0
## Komplettes Kartenset (150 Karten) & Implementierungsplan

---

## KARTEN-ÜBERSICHT NACH TYP

### OPCODES (Angriff/Verteidigung) - 60 Karten

#### TIER 1: COMMON (★☆☆☆☆) - Basis-Befehle

| ID | Name | ASCII/Emoji | Kosten | Effekt | DMG | DEF | CPU | Besonderheit |
|----|------|-------------|--------|--------|-----|-----|-----|--------------|
| OP-001 | `MOV` | `MOV AX, 💀` | 1 | Verschiebe Schaden | 3 | 0 | +0 | Kann auf Positionen zielen |
| OP-002 | `ADD` | `ADD 💀, 5` | 1 | Addition | 5 | 0 | +0 | +1 DMG pro Stack-Eintrag |
| OP-003 | `SUB` | `SUB 💀, 3` | 1 | Subtraktion | 3 | 0 | +0 | Verringert Gegner-CPU um 1 |
| OP-004 | `INC` | `INC 💀` | 1 | Inkrement | 2 | 0 | +0 | +1 DMG pro Runde (stapelbar) |
| OP-005 | `DEC` | `DEC 💀` | 1 | Dekrement | 4 | 0 | +0 | -1 Gegner-Rüstung |
| OP-006 | `PUSH` | `PUSH 💀` | 1 | Stack Push | 3 | 0 | +0 | Legt Marker auf Stack |
| OP-007 | `POP` | `POP 💀` | 1 | Stack Pop | 4 | 0 | +0 | Entfernt letzten Stack-Eintrag |
| OP-008 | `AND` | `AND 💀, 0xFF` | 1 | Bitwise AND | 3 | 0 | +0 | Ignoriert 50% Rüstung |
| OP-009 | `OR` | `OR 💀, 0xFF` | 1 | Bitwise OR | 4 | 0 | +0 | +1 DMG pro Buff auf Gegner |
| OP-010 | `XOR` | `XOR 💀, 0xFF` | 1 | Bitwise XOR | 3 | 0 | +0 | Entfernt 1 zufälligen Gegner-Buff |
| OP-011 | `NOT` | `NOT 💀` | 1 | Bitwise NOT | 2 | 0 | +0 | Konvertiert Heilung zu Schaden |
| OP-012 | `SHL` | `SHL 💀, 1` | 1 | Shift Left | 2 | 0 | +0 | Nächste Karte x2 DMG |
| OP-013 | `SHR` | `SHR 💀, 1` | 1 | Shift Right | 2 | 0 | +0 | Teile Gegner-CPU durch 2 |
| OP-014 | `CMP` | `CMP 💀, AX` | 1 | Compare | 0 | 0 | +0 | Zeigt Gegner-Stats, +2 nächste Karte |
| OP-015 | `JMP` | `JMP 0xFF` | 1 | Jump | 0 | 0 | +0 | Bewege dich 2 Felder |
| OP-016 | `CALL` | `CALL 💀` | 1 | Call | 3 | 0 | +0 | +1 Karte ziehen |
| OP-017 | `RET` | `RET` | 1 | Return | 0 | 0 | +0 | Zurück zur letzten Position |
| OP-018 | `NOP` | `NOP` | 0 | No Operation | 0 | 0 | +1 | +1 CPU-Zyklus |
| OP-019 | `HLT` | `HLT` | 2 | Halt | 0 | 0 | +0 | Gegner überspringt nächsten Zug |
| OP-020 | `INT` | `INT 0x80` | 2 | Interrupt | 5 | 0 | +0 | Unterbricht Gegner-Aktion |

#### TIER 2: UNCOMMON (★★☆☆☆) - Erweiterte Befehle

| ID | Name | ASCII/Emoji | Kosten | Effekt | DMG | DEF | CPU | Besonderheit |
|----|------|-------------|--------|--------|-----|-----|-----|--------------|
| OP-021 | `MUL` | `MUL 💀, 3` | 2 | Multiplikation | 6 | 0 | +0 | x1.5 DMG wenn Gegner >50% HP |
| OP-022 | `DIV` | `DIV 💀, 2` | 2 | Division | 4 | 0 | +0 | /2 Gegner-DMG nächste Runde |
| OP-023 | `MOD` | `MOD 💀, 7` | 2 | Modulo | 3 | 0 | +0 | Rest als Rüstung für dich |
| OP-024 | `NEG` | `NEG 💀` | 2 | Negate | 4 | 0 | +0 | Kehrt Gegner-Buff um |
| OP-025 | `TEST` | `TEST 💀, AX` | 2 | Test | 0 | 0 | +0 | Setzt Flags: Nächste Karte +50% |
| OP-026 | `JZ` | `JZ 0x00` | 2 | Jump if Zero | 0 | 0 | +0 | Wenn Gegner 0 CPU: INSTANT 10 DMG |
| OP-027 | `JNZ` | `JNZ 0xFF` | 2 | Jump if Not Zero | 0 | 0 | +0 | Wenn Gegner >0 CPU: +5 DMG |
| OP-028 | `JE` | `JE 0x00` | 2 | Jump if Equal | 0 | 0 | +0 | Wenn gleiche Position: 8 DMG |
| OP-029 | `JNE` | `JNE 0xFF` | 2 | Jump if Not Equal | 0 | 0 | +0 | Wenn andere Position: 6 DMG |
| OP-030 | `JA` | `JA 0xFF` | 2 | Jump if Above | 0 | 0 | +0 | Wenn du mehr HP: +7 DMG |
| OP-031 | `JB` | `JB 0x00` | 2 | Jump if Below | 0 | 0 | +0 | Wenn du weniger HP: Heile 10 |
| OP-032 | `JO` | `JO 0xFF` | 2 | Jump if Overflow | 0 | 0 | +0 | Wenn Gegner voll Buffs: 15 DMG |
| OP-033 | `CLC` | `CLC` | 2 | Clear Carry | 0 | 2 | +0 | +2 Rüstung, entfernt Debuffs |
| OP-034 | `STC` | `STC` | 2 | Set Carry | 0 | 0 | +0 | Nächste Karte kann nicht failen |
| OP-035 | `CLI` | `CLI` | 2 | Clear Interrupt | 0 | 0 | +0 | Immun gegen Interrupts 2 Runden |
| OP-036 | `STI` | `STI` | 2 | Set Interrupt | 0 | 0 | +0 | Deine Interrupts +50% Effekt |
| OP-037 | `PUSHF` | `PUSHF` | 2 | Push Flags | 0 | 0 | +0 | Speichere aktuellen Zustand |
| OP-038 | `POPF` | `POPF` | 2 | Pop Flags | 0 | 0 | +0 | Stelle gespeicherten Zustand wieder her |
| OP-039 | `SAHF` | `SAHF` | 2 | Store AH into Flags | 0 | 0 | +0 | Konvertiere HP-Differenz zu Buff |
| OP-040 | `LAHF` | `LAHF` | 2 | Load AH from Flags | 0 | 0 | +0 | Konvertiere Buff zu HP |

#### TIER 3: RARE (★★★☆☆) - Komplexe Operationen

| ID | Name | ASCII/Emoji | Kosten | Effekt | DMG | DEF | CPU | Besonderheit |
|----|------|-------------|--------|--------|-----|-----|-----|--------------|
| OP-041 | `IMUL` | `IMUL 💀, 0xFF` | 3 | Signed Multiply | 8 | 0 | +0 | x2 DMG wenn Gegner negativer Buff |
| OP-042 | `IDIV` | `IDIV 💀, 0xFF` | 3 | Signed Divide | 6 | 0 | +0 | /2 Gegner-Max-HP (temporär) |
| OP-043 | `MOVSX` | `MOVSX 💀, AX` | 3 | Move with Sign Extend | 5 | 0 | +0 | Übertrage Gegner-Debuff auf dich als Buff |
| OP-044 | `MOVZX` | `MOVZX 💀, AX` | 3 | Move with Zero Extend | 5 | 0 | +0 | Konvertiere Gegner-Buff zu neutral |
| OP-045 | `LEA` | `LEA 💀, [0xFF]` | 3 | Load Effective Address | 0 | 0 | +0 | Berechne optimalen Zug, +3 nächste Karte |
| OP-046 | `XCHG` | `XCHG 💀, AX` | 3 | Exchange | 0 | 0 | +0 | Tausche HP mit Gegner (Differenz/2) |
| OP-047 | `BSWAP` | `BSWAP 💀` | 3 | Byte Swap | 6 | 0 | +0 | Kehre Gegner-Position um (Teleport) |
| OP-048 | `BSF` | `BSF 💀` | 3 | Bit Scan Forward | 4 | 0 | +0 | Finde schwächsten Punkt, +50% DMG |
| OP-049 | `BSR` | `BSR 💀` | 3 | Bit Scan Reverse | 4 | 0 | +0 | Finde stärksten Punkt, zerstöre Buff |
| OP-050 | `BT` | `BT 💀, 7` | 3 | Bit Test | 3 | 0 | +0 | Teste Gegner-Bit, wenn gesetzt: +10 DMG |
| OP-051 | `BTS` | `BTS 💀, 7` | 3 | Bit Test and Set | 5 | 0 | +0 | Setze Gegner-Bit, Effekt abhängig von Bit |
| OP-052 | `BTR` | `BTR 💀, 7` | 3 | Bit Test and Reset | 5 | 0 | +0 | Lösche Gegner-Bit, Heile um Bit-Wert |
| OP-053 | `BTC` | `BTC 💀, 7` | 3 | Bit Test and Complement | 4 | 0 | +0 | Flippe Gegner-Bit, zufälliger Effekt |
| OP-054 | `CMPXCHG` | `CMPXCHG 💀, AX` | 3 | Compare and Exchange | 0 | 0 | +0 | Wenn gleich: Tausche Karten mit Gegner |
| OP-055 | `XADD` | `XADD 💀, AX` | 3 | Exchange and Add | 6 | 0 | +0 | Addiere, tausche Ergebnis |
| OP-056 | `CMPXCHG8B` | `CMPXCHG8B 💀` | 3 | Compare and Exchange 8 Bytes | 0 | 0 | +0 | Wenn gleich: Tausche komplette Hände |
| OP-057 | `RDTSC` | `RDTSC` | 3 | Read Time-Stamp Counter | 0 | 0 | +0 | Erhalte exakte Gegner-Stats, +2 CPU |
| OP-058 | `CPUID` | `CPUID` | 3 | CPU Identification | 0 | 0 | +0 | Identifiziere Gegner-Typ, +25% DMG danach |
| OP-059 | `RDRAND` | `RDRAND` | 3 | Read Random Number | 0 | 0 | +0 | Zufälliger Effekt (1-20 DMG oder Heilung) |
| OP-060 | `RDSEED` | `RDSEED` | 3 | Read Random Seed | 0 | 0 | +0 | Setze Seed für deterministische RNG |

---

### DATA_PACKETS (Ressourcen/Status) - 45 Karten

#### TIER 1: COMMON (★☆☆☆☆) - Basis-Daten

| ID | Name | Hex/Emoji | Kosten | Effekt | HP | CPU | Rüstung | Dauer |
|----|------|-----------|--------|--------|-----|-----|---------|-------|
| DP-001 | `0x00` | `0x00 NULL` | 0 | Null Pointer | 0 | +0 | 0 | Instant |
| DP-002 | `0x01` | `0x01 TRUE` | 1 | Boolean True | 0 | +1 | 0 | 1 Runde |
| DP-003 | `0xFF` | `0xFF MAX` | 1 | Max Value | 0 | +2 | 0 | 1 Runde |
| DP-004 | `0x0D` | `0x0D \r` | 1 | Carriage Return | +3 | +0 | 0 | Instant |
| DP-005 | `0x0A` | `0x0A \n` | 1 | Line Feed | +2 | +1 | 0 | Instant |
| DP-006 | `0x20` | `0x20 SPC` | 1 | Space | 0 | +0 | 1 | 2 Runden |
| DP-007 | `0x41` | `0x41 'A'` | 1 | ASCII A | +4 | +0 | 0 | Instant |
| DP-008 | `0x7F` | `0x7F DEL` | 1 | Delete | 0 | +0 | 0 | Instant |
| DP-009 | `0x80` | `0x80 HIGH` | 2 | High Bit | 0 | +0 | 2 | 3 Runden |
| DP-010 | `0xFE` | `0xFE -2` | 1 | Signed -2 | -2 | +3 | 0 | 1 Runde |
| DP-011 | `0xCA` | `0xCA CAFE` | 1 | CAFE Prefix | 0 | +1 | 0 | 2 Runden |
| DP-012 | `0xFE` | `0xFE BABE` | 1 | BABE Suffix | 0 | +1 | 0 | 2 Runden |
| DP-013 | `0xDE` | `0xDE DEAD` | 1 | DEAD Prefix | 0 | +0 | 0 | Instant |
| DP-014 | `0xAD` | `0xAD BEEF` | 1 | BEEF Suffix | +5 | -1 | 0 | Instant |
| DP-015 | `0xBA` | `0xBA BAAD` | 1 | BAAD Prefix | 0 | +0 | 0 | Instant |

#### TIER 2: UNCOMMON (★★☆☆☆) - Kombinierte Daten

| ID | Name | Hex/Emoji | Kosten | Effekt | HP | CPU | Rüstung | Dauer |
|----|------|-----------|--------|--------|-----|-----|---------|-------|
| DP-016 | `0xCAFE` | `☕ 0xCAFE` | 2 | Coffee Break | +5 | +2 | 0 | 2 Runden |
| DP-017 | `0xBABE` | `👶 0xBABE` | 2 | Baby Process | +3 | +1 | 1 | 3 Runden |
| DP-018 | `0xDEAD` | `💀 0xDEAD` | 2 | Deadlock | +8 | -2 | 0 | 1 Runde |
| DP-019 | `0xBEEF` | `🥩 0xBEEF` | 2 | Stack Overflow | +10 | +0 | 0 | Instant |
| DP-020 | `0xBAAD` | `👎 0xBAAD` | 2 | Bad Sector | +4 | +0 | 0 | Instant |
| DP-021 | `0xF00D` | `🍔 0xF00D` | 2 | Food for Thought | +6 | +1 | 0 | 2 Runden |
| DP-022 | `0xC0DE` | `💻 0xC0DE` | 2 | Code Segment | +2 | +2 | 0 | 3 Runden |
| DP-023 | `0xD15C` | `💿 0xD15C` | 2 | Disc Error | +4 | +0 | 1 | 2 Runden |
| DP-024 | `0xFACE` | `😶 0xFACE` | 2 | Interface | +3 | +0 | 2 | 2 Runden |
| DP-025 | `0xCA11` | `📞 0xCA11` | 2 | Function Call | +2 | +3 | 0 | 1 Runde |
| DP-026 | `0xD06F` | `🐕 0xD06F` | 2 | Watchdog | +5 | +0 | 0 | 2 Runden |
| DP-027 | `0xF1AC` | `🚩 0xF1AC` | 2 | Flag Check | +3 | +1 | 1 | 2 Runden |
| DP-028 | `0xD3AD` | `☠️ 0xD3AD` | 2 | Dead Process | +7 | -1 | 0 | 1 Runde |
| DP-029 | `0xC0FF` | `☕ 0xC0FF` | 2 | Coffee Overflow | +4 | +2 | 0 | 2 Runden |
| DP-030 | `0xFEE1` | `🍽️ 0xFEE1` | 2 | Feelings | +5 | +0 | 0 | 3 Runden |

#### TIER 3: RARE (★★★☆☆) - Magische Zahlen

| ID | Name | Hex/Emoji | Kosten | Effekt | HP | CPU | Rüstung | Dauer |
|----|------|-----------|--------|--------|-----|-----|---------|-------|
| DP-031 | `0xCAFEBABE` | `☕👶 0xCAFEBABE` | 3 | Java Magic | +8 | +3 | 1 | 3 Runden |
| DP-032 | `0xDEADBEEF` | `💀🥩 0xDEADBEEF` | 3 | Dead Beef | +12 | -3 | 0 | 1 Runde |
| DP-033 | `0xBAADF00D` | `👎🍔 0xBAADF00D` | 3 | Bad Food | +6 | +2 | 2 | 3 Runden |
| DP-034 | `0xFEE1DEAD` | `🍽️💀 0xFEE1DEAD` | 3 | Feel Dead | +10 | +0 | 0 | 2 Runden |
| DP-035 | `0x8BADF00D` | `👎🍔 0x8BADF00D` | 3 | Ate Bad Food | +7 | +1 | 1 | 3 Runden |
| DP-036 | `0xC00010FF` | `💻💀 0xC00010FF` | 3 | Cool Off | +5 | +3 | 2 | 3 Runden |
| DP-037 | `0x1BADB002` | `👎💻 0x1BADB002` | 3 | Bad Boot | +9 | -2 | 0 | 2 Runden |
| DP-038 | `0xB16B00B5` | `👶 0xB16B00B5` | 3 | Big Boobs | +6 | +2 | 2 | 3 Runden |
| DP-039 | `0x0DEFACED` | `😶 0x0DEFACED` | 3 | Defaced | +8 | +0 | 1 | 2 Runden |
| DP-040 | `0xD15EA5E` | `💿 0xD15EA5E` | 3 | Disease | +11 | -1 | 0 | 1 Runde |
| DP-041 | `0xDABBAD00` | `👎 0xDABBAD00` | 3 | Dabba Doo | +5 | +2 | 2 | 3 Runden |
| DP-042 | `0xCA55E77E` | `💻 0xCA55E77E` | 3 | Cassette | +7 | +1 | 1 | 3 Runden |
| DP-043 | `0x0B5E55ED` | `👍 0x0B5E55ED` | 3 | Obsessed | +4 | +3 | 2 | 3 Runden |
| DP-044 | `0xD0D0CACA` | `💩 0xD0D0CACA` | 3 | Dodo Caca | +6 | +1 | 1 | 2 Runden |
| DP-045 | `0xDEAD10CC` | `💀 0xDEAD10CC` | 3 | Dead Lock | +9 | +0 | 0 | 2 Runden |

---

### EXPLOITS (Spezial/Combo) - 30 Karten

#### TIER 2: UNCOMMON (★★☆☆☆) - Basis-Exploits

| ID | Name | Trigger | Kosten | Effekt | Bedingung |
|----|------|---------|--------|--------|-----------|
| EX-001 | `SQL_INJECTION` | `DATABASE`-Tag | 4 | Stehle 2 Gegner-Karten, spiele 1 | Gegner hat `DATABASE` |
| EX-002 | `XSS` | `WEB`-Tag | 3 | Injiziere Script: Gegner greift sich selbst an | Gegner hat `WEB` |
| EX-003 | `CSRF` | `SESSION`-Tag | 3 | Zwinge Gegner, seine stärkste Karte zu spielen | Gegner hat `SESSION` |
| EX-004 | `LFI` | `FILESYSTEM`-Tag | 3 | Lade beliebige Karte aus deinem Friedhof | Gegner hat `FILESYSTEM` |
| EX-005 | `RFI` | `NETWORK`-Tag | 4 | Lade Karte aus zufälligem anderen Deck | Gegner hat `NETWORK` |
| EX-006 | `XXE` | `XML`-Tag | 3 | Parse Gegner-Interna: Erhalte alle seine Stats | Gegner hat `XML` |
| EX-007 | `SSRF` | `URL`-Tag | 3 | Zwinge Gegner, auf sich selbst zuzugreifen | Gegner hat `URL` |
| EX-008 | `IDOR` | `ID`-Tag | 2 | Zugriff auf "versteckte" Gegner-Ressourcen | Gegner hat `ID` |
| EX-009 | `PATH_TRAVERSAL` | `PATH`-Tag | 3 | Bewege dich außerhalb des Grids (Immunität 1 Runde) | Gegner hat `PATH` |
| EX-010 | `COMMAND_INJECTION` | `SHELL`-Tag | 4 | Führe beliebigen Befehl aus (wähle aus 3 zufälligen) | Gegner hat `SHELL` |

#### TIER 3: RARE (★★★☆☆) - Fortgeschrittene Exploits

| ID | Name | Trigger | Kosten | Effekt | Bedingung |
|----|------|---------|--------|--------|-----------|
| EX-011 | `BUFFER_OVERFLOW` | Stack ≥4 | 4 | Verdopple Schaden, nächste Karte 50% Fail | Stack ≥4 Karten |
| EX-012 | `FORMAT_STRING` | `PRINTF`-Tag | 3 | Lese Gegner-Speicher: Erhalte seinen Zug als Karte | Gegner hat `PRINTF` |
| EX-013 | `USE_AFTER_FREE` | Friedhof ≥5 | 4 | Spiele Friedhof-Karte nochmal (permanent!) | Friedhof ≥5 |
| EX-014 | `DOUBLE_FREE` | Friedhof ≥10 | 5 | Zerstöre Gegner-Heap: Erhalte alle seine DATA_PACKETS | Friedhof ≥10 |
| EX-015 | `INTEGER_OVERFLOW` | Du <10 HP | 3 | Kehre alle Werte um (Heilung↔Schaden) | Du <10 HP |
| EX-016 | `RACE_CONDITION` | Stack ≥3 | 3 | Spiele 2 Karten gleichzeitig | Stack ≥3 |
| EX-017 | `TOCTOU` | Neben Gegner | 2 | Gegner prüft Position, du bewegst dich danach | Neben Gegner |
| EX-018 | `SYMLINK_RACE` | ≥2 Entitäten | 3 | Tausche Position mit zufälliger Entität | ≥2 Entitäten |
| EX-019 | `OFF_BY_ONE` | Immer | 1 | +1 zu ALLEM diese Runde | Immer |
| EX-020 | `SIGNEDNESS` | Gegner negativ | 3 | Konvertiere Gegner-negativen Wert zu positivem für dich | Gegner hat negative Werte |

#### TIER 4: EPIC (★★★★☆) - Meister-Exploits

| ID | Name | Trigger | Kosten | Effekt | Bedingung |
|----|------|---------|--------|--------|-----------|
| EX-021 | `HEARTBLEED` | Du <30% HP | 2 | Schaden = fehlendes Leben x2 | Du <30% HP |
| EX-022 | `SHELLSHOCK` | `BASH`-Tag | 5 | Führe beliebige 3 Befehle aus | Gegner hat `BASH` |
| EX-023 | `GHOST` | `GETHOST`-Tag | 4 | Dupliziere dich selbst (2x Aktionen, 2x Schaden empfangen) | Gegner hat `GETHOST` |
| EX-024 | `PWNKIT` | `PKEXEC`-Tag | 5 | INSTANT_ROOT: Ignoriere alle Gegner-Effekte 3 Runden | Gegner hat `PKEXEC` |
| EX-025 | `LOG4SHELL` | `JNDI`-Tag | 4 | Lade beliebige Karte aus INTERNET (alle verfügbaren) | Gegner hat `JNDI` |
| EX-026 | `SPRING4SHELL` | `SPRING`-Tag | 4 | Injiziere beliebigen Class-Loader-Effekt | Gegner hat `SPRING` |
| EX-027 | `PROXYSHELL` | `EXCHANGE`-Tag | 5 | Erstelle Proxy: Du siehst/kontrollierst Gegner-Züge | Gegner hat `EXCHANGE` |
| EX-028 | `PROXYLOGON` | `EXCHANGE`-Tag | 4 | Authentifiziere als Gegner: Spiele seine Karten | Gegner hat `EXCHANGE` |
| EX-029 | `FOLLINA` | `MSDT`-Tag | 3 | Öffne Hilfe-Dokument: Erhalte Guide zu Gegner-Schwäche | Gegner hat `MSDT` |
| EX-030 | `DOGWalk` | `MSI`-Tag | 4 | Repariere System: Entferne alle Debuffs, heile voll | Gegner hat `MSI` |

#### TIER 5: LEGENDARY (★★★★★) - Göttliche Exploits

| ID | Name | Trigger | Kosten | Effekt | Bedingung |
|----|------|---------|--------|--------|-----------|
| EX-031 | `SPECTRE` | `SPECULATIVE`-Tag | 5 | Sieh nächste 5 Züge, cancel einen | Heap hat `SPECULATIVE` |
| EX-032 | `MELTDOWN` | Stack+Heap voll | 6 | Lösche alle DATA_PACKETS, Schaden = 3x Wert | Stack+Heap voll |
| EX-033 | `ROWHAMMER` | `DRAM`-Tag | 4 | Flippe Bit in Gegner-HP (z.B. 100→52 oder 100→148) | Gegner hat `DRAM` |
| EX-034 | `CACHE_POISONING` | `CACHE`-Tag | 6 | Gegner greift sich 3 Runden selbst an | Gegner hat `CACHE` |
| EX-035 | `RETURN_ORIENTED` | Stack ≥1 | 5 | Spiele letzte Karte nochmal (kostenlos) | Stack ≥1 |
| EX-036 | `JIT_SPRAY` | `JAVASCRIPT`-Tag | 5 | Erstelle zufällige Karte jede Runde (aus allen) | Gegner hat `JAVASCRIPT` |
| EX-037 | `HEAP_SPRAY` | Heap leer | 5 | Fülle Heap mit 10 `0x41` (1 DMG each, Overflow-Risiko) | Heap leer |
| EX-038 | `NULL_POINTER_DEREF` | Immer | 0 | INSTANT_DEATH... aber mit `0x00`-Karte: Überlebe, heile voll | Immer (Riskant!) |
| EX-039 | `TYPE_CONFUSION` | `OOP`-Tag | 4 | Gegner-Karte wird zu deiner (dauerhaft!) | Gegner hat `OOP` |
| EX-040 | `DOUBLE_FETCH` | Hand ≤2 | 3 | Ziehe 2 Karten, spiele beide sofort | Hand ≤2 |

---

### SYSTEM_CALLS (Spezialfähigkeiten) - 15 Karten

| ID | Name | Kosten | Effekt | Cooldown | Seltenheit |
|----|------|--------|--------|----------|------------|
| SC-001 | `fork()` | 3 | Spawne Klon (50% deiner Stats, eigener Zug) | 5 Runden | ★★★☆☆ |
| SC-002 | `execve()` | 4 | Ersetze dein Deck durch zufälliges neues (behält HP) | 3 Runden | ★★★☆☆ |
| SC-003 | `kill()` | 2 | Sende Signal: Wähle aus SIGTERM(-10HP), SIGKILL(-20HP), SIGHUP(Reset Buffs) | 2 Runden | ★★☆☆☆ |
| SC-004 | `mmap()` | 3 | Erstelle neue Speicherzone: +2 Handplatz | 4 Runden | ★★☆☆☆ |
| SC-005 | `munmap()` | 2 | Entferne Speicherzone: Entferne 3 schwache Karten | 3 Runden | ★★☆☆☆ |
| SC-006 | `ioctl()` | 3 | Geräte-Kontrolle: Zufälliger starker Effekt | 2 Runden | ★★★☆☆ |
| SC-007 | `ptrace()` | 4 | Debugge Gegner: Sieh seine Hand, manipuliere eine Karte | 5 Runden | ★★★★☆ |
| SC-008 | `setuid()` | 5 | Werde Root: Ignoriere alle Kosten 2 Runden | 7 Runden | ★★★★☆ |
| SC-009 | `chroot()` | 3 | Gefängnis: Gegner kann 2 Runden nicht fliehen | 4 Runden | ★★★☆☆ |
| SC-010 | `nice()` | 2 | Priorität: Deine Karten kosten -1 CPU 3 Runden | 4 Runden | ★★☆☆☆ |
| SC-011 | `alarm()` | 2 | Timer: In 3 Runden: 15 DMG auf Gegner (nicht blockbar) | 3 Runden | ★★☆☆☆ |
| SC-012 | `sigaction()` | 3 | Signal-Handler: Wenn du Schaden nimmst, reflect 50% | 5 Runden | ★★★☆☆ |
| SC-013 | `pipe()` | 2 | Pipeline: Nächste 2 Karten haben kombinierten Effekt | 3 Runden | ★★☆☆☆ |
| SC-014 | `socket()` | 3 | Netzwerk: Erhalte Karte aus zufälligem anderem Modul | 4 Runden | ★★★☆☆ |
| SC-015 | `reboot()` | 6 | Systemneustart: Reset Kampf, behalte Bugs, volles HP | Einmal pro Run | ★★★★★ |

---

## BALANCING-MATHEMATIK

### Grundformeln

```
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
```

### Seltenheits-Wahrscheinlichkeiten

```
COMMON (★☆☆☆☆): 60% Drop-Rate, Shop-Kosten: 10-20 Bugs
UNCOMMON (★★☆☆☆): 25% Drop-Rate, Shop-Kosten: 25-40 Bugs
RARE (★★★☆☆): 10% Drop-Rate, Shop-Kosten: 50-80 Bugs
EPIC (★★★★☆): 4% Drop-Rate, Shop-Kosten: 100-150 Bugs
LEGENDARY (★★★★★): 1% Drop-Rate, Shop-Kosten: 250-400 Bugs
```

### Modul-Balancing

| Modul | Start-HP | Start-CPU | Handgröße | Schwierigkeit |
|-------|----------|-----------|-----------|---------------|
| `netfilter.ko` | 80 | 8 | 5 | Leicht |
| `ext4.ko` | 120 | 6 | 5 | Leicht |
| `nvidia.ko` | 90 | 10 | 6 | Mittel |
| `wireguard.ko` | 100 | 7 | 5 | Mittel |
| `bpf.o` | 85 | 9 | 5 | Schwer |
| `kvm.ko` | 110 | 8 | 5 | Schwer |
| `zfs.ko` | 130 | 5 | 4 | Schwer |

---

## IMPLEMENTIERUNGSPLAN

### PHASE 1: PROTOTYP (Woche 1-2)
**Ziel: Spielbarer Kampf-Loop**

#### Tech-Stack Optionen

**Option A: Vanilla JS + HTML5 Canvas**
```
Frontend: Pure JavaScript (ES2022+)
Renderer: HTML5 Canvas 2D
State: Custom Event-Driven Architecture
Build: Vite (schnelles Bundling)
Storage: localStorage
```
**Pro:** Maximale Kontrolle, kein Overhead, leicht zu hosten
**Con:** Alles selbst bauen, keine vorgefertigten Systeme

**Option B: Phaser 3**
```
Engine: Phaser 3 (WebGL/Canvas)
State: Phaser Scene Manager
Physics: Arcade Physics (leichtgewichtig)
Input: Phaser Input Manager
Build: Webpack/Vite
```
**Pro:** Reife Engine, gute Performance, viele Beispiele
**Con:** Overhead für ein Kartenspiel, lernt manchmal gegen die Engine an

**Option C: PixiJS + eigene Logik**
```
Renderer: PixiJS (WebGL)
UI: HTML/CSS Overlay für Karten/Stats
State: Zustand-Maschine (XState oder custom)
Build: Vite
```
**Pro:** Beste Performance, flexibel, gute Partikel-Effekte
**Con:** Mehr Setup-Arbeit als Phaser

**EMPFEHLUNG: Option C (PixiJS + Vite)**
- Beste Performance für Partikel-Effekte (Bit-Flips, CRT-Scanlines)
- HTML/CSS-Overlay für Karten-UI (einfacher als alles in Canvas)
- Moderner Workflow mit Hot Reload

#### Phase 1 Milestones

```
Tag 1-2: Projekt-Setup, Canvas-Renderer, ASCII-Sprite-System
Tag 3-4: Hex-Grid-Implementierung, Bewegungs-Logik
Tag 5-6: Karten-System (ziehen, spielen, Effekte)
Tag 7-8: Kampf-Loop (Runden, Gegner-AI, Schaden)
Tag 9-10: Basis-UI (HP, CPU, Stack, Heap-Anzeige)
Tag 11-14: 20 Karten implementieren, 3 Gegner, Balancing-Tests
```

### PHASE 2: KERNSPIEL (Woche 3-4)
**Ziel: Kompletter Act 1 spielbar**

```
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
```

### PHASE 3: CONTENT (Woche 5-6)
**Ziel: Alle 3 Acts + Final Boss**

```
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
```

### PHASE 4: POLISH (Woche 7-8)
**Ziel: Release-Ready**

```
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
```

---

## DETAILLIERTER TECH-STACK

### Empfohlene Architektur

```
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
```

### Wichtige Dependencies

```json
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
```

### Karten-Effekt-Engine (Pseudocode)

```typescript
// Karten-Definition in cards.json
{
  "id": "OP-041",
  "name": "IMUL",
  "tier": "RARE",
  "cost": 3,
  "type": "OPCODE",
  "ascii": "IMUL 💀, 0xFF",
  "effects": [
    {
      "type": "DAMAGE",
      "value": 8,
      "target": "ENEMY",
      "condition": {
        "type": "ENEMY_HAS_NEGATIVE_BUFF",
        "multiplier": 2.0
      }
    }
  ],
  "tags": ["ARITHMETIC", "SIGNED"],
  "flavor": "Signed multiply. Watch the overflow."
}

// Effekt-Engine
class CardEffectEngine {
  execute(card: Card, context: CombatContext): EffectResult {
    const result = new EffectResult();

    for (const effect of card.effects) {
      let value = effect.value;

      // Bedingungen prüfen
      if (effect.condition) {
        value = this.applyCondition(effect, context);
      }

      // Effekt ausführen
      switch (effect.type) {
        case "DAMAGE":
          result.damage = this.calculateDamage(value, context);
          break;
        case "HEAL":
          result.healing = value;
          break;
        case "CPU_GAIN":
          result.cpuGain = value;
          break;
        case "ARMOR":
          result.armor = value;
          break;
        case "DRAW":
          result.drawCount = value;
          break;
        case "SPECIAL":
          result.special = this.executeSpecial(effect, context);
          break;
      }
    }

    return result;
  }
}
```

### Hex-Grid-System

```typescript
class HexGrid {
  // Axial coordinates (q, r)
  private grid: Map<string, HexCell>;

  // Nachbarn eines Hex-Felds
  getNeighbors(q: number, r: number): HexCell[] {
    const directions = [
      {q: 1, r: 0}, {q: 1, r: -1}, {q: 0, r: -1},
      {q: -1, r: 0}, {q: -1, r: 1}, {q: 0, r: 1}
    ];

    return directions.map(dir => 
      this.getCell(q + dir.q, r + dir.r)
    ).filter(cell => cell !== null);
  }

  // Distanz zwischen zwei Hex-Feldern
  getDistance(a: HexPos, b: HexPos): number {
    return (Math.abs(a.q - b.q) 
          + Math.abs(a.q + a.r - b.q - b.r) 
          + Math.abs(a.r - b.r)) / 2;
  }

  // Pfadfindung (A*)
  findPath(start: HexPos, end: HexPos): HexPos[] {
    // A* Implementation für Hex-Grid
  }
}
```

### Seeded RNG (für Replays)

```typescript
class SeededRNG {
  private seed: string;
  private rng: seedrandom.prng;

  constructor(seed: string) {
    this.seed = seed;
    this.rng = seedrandom(seed);
  }

  // Zufällige Zahl 0-1
  random(): number {
    return this.rng();
  }

  // Zufällige Zahl in Range
  range(min: number, max: number): number {
    return Math.floor(this.rng() * (max - min + 1)) + min;
  }

  // Zufälliges Element aus Array
  pick<T>(array: T[]): T {
    return array[this.range(0, array.length - 1)];
  }

  // Shuffle Array (Fisher-Yates)
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.range(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
```

---

## SOUND-DESIGN SPEZIFIKATION

### Web Audio API Synthesizer

```typescript
class SynthEngine {
  private ctx: AudioContext;

  // 8-Bit Explosion
  playExplosion() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  // Karten-Spiel Klick
  playCardClick() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // Schaden-Glitch
  playDamageGlitch() {
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 10;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }
}
```

---

## PERFORMANCE-BUDGET

```
Ziel: 60 FPS auf Mid-Range Laptop (i5, integrated GPU)

Canvas-Elemente:
- Hex-Grid: 16 Felde, 1 Drawcall pro Feld = 16 Drawcalls
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
```

---

## TESTING-STRATEGIE

```
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
```

---

## DEPLOYMENT

```
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
```

---

## ZEITPLAN ZUSAMMENFASSUNG

| Phase | Wochen | Ziel | Deliverable |
|-------|--------|------|-------------|
| 1 | 1-2 | Prototyp | Spielbarer Kampf, 20 Karten, 3 Gegner |
| 2 | 3-4 | Kernspiel | Act 1 komplett, 7 Module, Boss |
| 3 | 5-6 | Content | Alle 3 Acts, 150 Karten, Final Boss |
| 4 | 7-8 | Polish | Release-Ready, Sound, Animationen |

**Gesamt: 8 Wochen für MVP**
**+2 Wochen Puffer für Bug-Fixing**
**= 10 Wochen bis Release**

---

*"It's not a bug, it's a feature."*
*— NULL_POINTER Development Team*
