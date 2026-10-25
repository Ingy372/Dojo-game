How to rerun: copy boss-levers-probe.test.ts into packages/sim/test/ on the B-T3-TUNE branch (Hearth Cook 549/17). Set VARIANTS (JSON) and N, then run `npx vitest run test/boss-levers-probe.test.ts`. Results go to /tmp/probe.txt.
The "lid" and "summon2" variants also need two temporary lines in packages/sim/src/world.ts (probe only, never committed):
- in hurtEnemy: `if ((e.def as any).lid && world.enemies.some(o => o.summoned && o.mode !== 'defeated')) dmg = 0;`
- in stepEnemy, after the summon line: run summonHelpers a second time (count = summon2.count) when health first falls to summon2.atHealthFraction.
