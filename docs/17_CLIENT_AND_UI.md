# Client and UI (OTClient, mehah fork)

All custom UI lives in `client/modules/spire_*`. Server ↔ client data uses TFS extended opcodes (JSON payloads), opcode numbers below.

| Module | Opcode | Purpose |
|---|---|---|
| spire_skillbar | 0x50 cast, 0x51 state | 4 skill slots (keys 1–4), cooldown sweeps, resource cost tooltip, basic-attack toggle |
| spire_resource | 0x51 | Relabels the mana bar: Stamina (melee, Slinger) or Focus (Arcanist); arrow count beside it for Slinger |
| spire_stats | 0x52 | Stat allocation window with the 40% rule enforced client- and server-side |
| spire_proficiency | 0x53 | Proficiency per weapon group, next row, world-gate lock icon |
| spire_floor_tracker | 0x54 | Top bar: "Floor 3 open · Floor 4 sealed", live world-first feed |
| spire_secrets | 0x55 | Packet list: found, unsold/sold, sell button only at Vesper |
| spire_house_window | 0x56 | Head-start countdown, district list, broadcast banner |
| spire_boss_frame | 0x57 | Boss HP, phase, enrage timer, your contribution rank (top 20 line) |
| spire_echo | 0x58 | Echo lockout timers per floor |
| spire_login_notice | — | First-login screen: "Fan-inspired, unofficial, not affiliated with any rights holder. No pay-to-win." |

Rules
- Hide magic level and soul points. Rename "Mana" per path.
- Remove the bot module and any macro/hotkey-automation features beyond plain hotkeys.
- Asset hash check at login (server sends expected hash of dat/spr).
- Windows build signed (HANDOFF: certificate). Publish SHA-256 of the installer on the website.
- Client strings pass tools/check_names.py.
