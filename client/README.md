# client

The Spirebound client is OTClient (mehah fork, MIT license) at a pinned commit, plus our changes.
We do not vendor the client source; `.github/workflows/client-windows.yml` checks out the pinned commit,
builds it, and `tools/package_client.py` applies Spirebound's changes:

- name, server list (our login server only), our RSA public key
- the upstream third-party client-asset downloader is disabled
- `data/things/1098/` contains only `Spirebound.dat` / `Spirebound.spr` from `tools/build_assets.py`
- the bot module (`mods/game_bot`) is removed
- our UI modules from `client/modules/spire_*` (phase 1+)

Pinned: mehah/otclient @ 396f0b396741bdd4469f27cf9376103930712cff (recorded in STATUS.md).
