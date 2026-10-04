# Scale, operations, anti-cheat

500 concurrent would place Spirebound near the top of the entire OT scene (R6). Engineer for it; make sure the server also feels alive at 60–150.

## Host

- US East (Ashburn or New York). Dedicated or high-tier VPS: 8 vCPU (high clock), 32 GB RAM, NVMe, 1 Gbps, DDoS protection included (most OT launches are attacked; R7 forum reports).
- Ubuntu 24.04. MariaDB on the same host, data on a separate volume. Off-host backup target (object storage).
- TFS as a systemd service with automatic restart; crash dumps kept.
- maxPlayers = 600 with a client queue message past that.
- Server save + restart daily 05:00 ET (posted). Map save every 15 minutes.
- Staging server (small VPS) for every patch before production.

## Backups

- Nightly full DB dump, 14 kept on-host, 30 off-host. Hourly binlog shipping.
- Weekly restore drill to staging (phase 8 gate, then monthly).

## Monitoring

- Tick time (avg, p99), players online, memory, DB latency, disk, network: Prometheus node exporter + a TFS Lua globalevent that writes tick stats to a file; a tiny exporter reads it. Alert to the owner's Discord via webhook when p99 tick > 50 ms for 5 minutes or the server stops responding.
- Daily econ_report (07) and pacing report (median level per account-age bucket) posted to a private staff channel.

## Load test (phase 8 gate)

tools/loadbot: Python headless client for protocol 10.98 (RSA + XTEA login, walk, attack nearest, use salve, say). Scenario: 500 sessions, 300 hunting floors 1–2 camps, 200 idle in Hearthgate, 60 minutes. Pass: avg tick < 25 ms, p99 < 50 ms, no crash, no DB errors. If it fails: cut camp monster counts before cutting features; then upgrade CPU.

## Anti-cheat (R5)

Prevention
- Custom client only; protocol tweaks (custom opcode set, asset hash check). Built-in bot modules removed.
- Skills cast via opcode with server-side cooldowns and range checks — nothing a bot gains from frame-perfect input.
- Telegraphed mechanics punish unattended play; tasks rotate; daily caps on the most farmable faucets.
- Two clients per IP without manual allow; one character per account at launch.
Detection (log, never auto-ban in v1)
- Identical path loops > 20 min; 24 h+ online with steady XP; reaction-time outliers for salve use (< 80 ms consistently); impossible speed.
- Log table `suspicion(time, player, rule, detail)`; daily digest to staff.
Response
- Manual review with evidence; first offense 7-day ban + removal of gains, second offense permanent. Published rules on the website.

## Security

- Change default RSA key; never ship the private key in the client repo.
- MyAAC behind HTTPS; rate-limit account creation and login; captcha on registration.
- Login flood protection (TFS + firewall rate limits); status protocol rate-limited.
- Secrets (DB passwords, webhook URLs) only in /etc/spirebound/*.env, never in git.

## Launch plan

1. Closed beta (phase 9): 2–4 weeks, invite list, wipe at end.
2. Public launch on a Friday 18:00 ET. Staff (owner + at least one human GM) online for the first 6 hours. A visible launch countdown on the website.
3. First week: daily short dev note in Discord (what was fixed). Staff presence matters to OT communities (R7).
4. Day 30 review: population curve, retention by cohort (day 1/7/30), economy alarms, ban stats → owner decides on floor 6 timeline.
