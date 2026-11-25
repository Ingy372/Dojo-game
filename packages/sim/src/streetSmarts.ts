// Street Smarts: short real-world story scenes (framework section 8). The script is a data
// file in content/street-smarts/. This file walks through it: lines, choices, gentle retries
// and stars. A choice that isn't the best one never shows danger and never costs anything;
// Sensei talks it over and the player tries again right away.

export interface ScenarioChoice {
  text: string;
  stars: number;
  next: string;
  /** On a tap choice: the person (cast id) or place (room mark) the player taps for this answer. */
  target?: string;
}

/** The cut-scene moves a stage cue can make (Nov 24: Street Smarts plays like a cut scene). */
export const STAGE_ACTIONS = ['place', 'walk', 'face', 'emote', 'anim', 'hide', 'show', 'camera', 'pause'] as const;
export type StageAction = (typeof STAGE_ACTIONS)[number];
/** 'shout' shows the cue's own words in a big bubble ("NO!"); 'message' is a chat bubble over a phone or tablet. */
export const STAGE_EMOTES = ['question', 'toy', 'hearts', 'sound', 'shout', 'message', 'ball', 'candy'] as const;
export const STAGE_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

/**
 * One cut-scene move, played in order with the others on its line (with: true runs alongside the one before).
 * Marks (to, via, fit) are named spots in the scenario's room file; the client draws the moves, the rules only check them.
 */
export interface StageCue {
  do: StageAction;
  who?: string;
  to?: string;
  via?: string[];
  dir?: string;
  emote?: string;
  anim?: string;
  fit?: string[];
  secs?: number;
  speed?: 'walk' | 'hurry';
  with?: boolean;
  /** The words in a 'shout' bubble. */
  text?: string;
}

export interface ScenarioLine {
  id?: string;
  speaker: string;
  text: string;
  expression?: string;
  animation?: string;
  choices?: ScenarioChoice[];
  /** Go back to the choice with this id (only on the last line of a retry branch). */
  retry?: string;
  /** Cut-scene moves played when the line starts. */
  stage?: StageCue[];
  /** 'after': the words wait until the moves are done (default: they come with the moves). */
  say?: 'with' | 'after';
  /** The answers are picked by tapping people or places in the scene (each choice has a target). */
  tap?: boolean;
}

export interface ScenarioScene {
  id: string;
  kind: string;
  lines: ScenarioLine[];
  branches: Record<string, ScenarioLine[]>;
}

export interface Scenario {
  id: string;
  /** The room the cut scene plays in (content/street-smarts/<room>-room.json), or '' for none. */
  room: string;
  location: string;
  ageBand: string;
  topic: string;
  scenes: ScenarioScene[];
  /** The choice points that earn a star when the best answer is picked on the first try. */
  starChoices: string[];
  maxStars: number;
}

/** Most buttons one choice may show (CLAUDE.md rule 15: 2-4 large buttons). */
export const MAX_CHOICES = 4;

/** Reads a scenario file and checks every link in it, so a typo can't strand a player. */
export function loadScenario(data: unknown): Scenario {
  const d = data as Record<string, unknown>;
  const where = `Street Smarts "${String(d?.id)}"`;
  if (!d || typeof d.id !== 'string' || !Array.isArray(d.scenes) || d.scenes.length === 0) throw new Error(`${where}: needs an id and scenes`);
  const cast = new Set(['player', ...((Array.isArray(d.characters) ? d.characters : []) as { id: string }[]).map((c) => c.id)]);
  const checkLine = (l: ScenarioLine, at: string) => {
    if (!l || typeof l.speaker !== 'string' || typeof l.text !== 'string' || l.text.trim() === '') throw new Error(`${where}: ${at} needs a speaker and text`);
    if (l.say !== undefined && l.say !== 'with' && l.say !== 'after') throw new Error(`${where}: ${at} "say" must be "with" or "after"`);
    if (l.stage !== undefined && !Array.isArray(l.stage)) throw new Error(`${where}: ${at} stage must be a list`);
    (l.stage ?? []).forEach((c, i) => checkCue(c, `${at} stage ${i + 1}`));
  };
  const checkCue = (c: StageCue, at: string) => {
    const bad = (why: string) => new Error(`${where}: ${at}: ${why}`);
    if (!c || !(STAGE_ACTIONS as readonly string[]).includes(c.do)) throw bad(`unknown stage move "${c?.do}"`);
    const needsWho = ['place', 'walk', 'face', 'anim', 'hide', 'show'].includes(c.do);
    if (needsWho || c.who !== undefined) {
      if (typeof c.who !== 'string' || !cast.has(c.who)) throw bad(`"${c.who}" isn't in the cast`);
    }
    if ((c.do === 'place' || c.do === 'walk') && typeof c.to !== 'string') throw bad(`${c.do} needs "to"`);
    if (c.via !== undefined && (!Array.isArray(c.via) || c.via.some((m) => typeof m !== 'string'))) throw bad('"via" must be a list of marks');
    if (c.dir !== undefined && !(STAGE_DIRS as readonly string[]).includes(c.dir)) throw bad(`unknown direction "${c.dir}"`);
    if (c.do === 'face' && c.dir === undefined) throw bad('face needs "dir"');
    if (c.do === 'emote') {
      if (!(STAGE_EMOTES as readonly string[]).includes(String(c.emote))) throw bad(`unknown emote "${c.emote}"`);
      if (c.who === undefined && typeof c.to !== 'string') throw bad('emote needs "who" or "to"');
      if (c.emote === 'shout' && (typeof c.text !== 'string' || c.text.trim() === '')) throw bad('a shout needs "text"');
    }
    if (c.do === 'anim' && typeof c.anim !== 'string') throw bad('anim needs "anim"');
    if (c.do === 'camera' && (!Array.isArray(c.fit) || c.fit.length === 0)) throw bad('camera needs "fit"');
    if (c.do === 'pause' && !(typeof c.secs === 'number' && c.secs > 0)) throw bad('pause needs "secs"');
    if (c.speed !== undefined && c.speed !== 'walk' && c.speed !== 'hurry') throw bad('speed must be "walk" or "hurry"');
  };
  const scenes: ScenarioScene[] = [];
  const choiceIds = new Set<string>();
  for (const raw of d.scenes as ScenarioScene[]) {
    const branches = raw.branches ?? {};
    if (typeof raw.id !== 'string' || !Array.isArray(raw.lines) || raw.lines.length === 0) throw new Error(`${where}: every scene needs an id and lines`);
    const ids = new Set<string>();
    raw.lines.forEach((l, i) => {
      checkLine(l, `${raw.id} line ${i + 1}`);
      if (l.retry) throw new Error(`${where}: ${raw.id} line ${i + 1}: "retry" only goes in a branch`);
      if (l.choices) {
        if (!l.id) throw new Error(`${where}: a choice in ${raw.id} needs an id`);
        if (l.choices.length < 2 || l.choices.length > MAX_CHOICES) throw new Error(`${where}: ${l.id} needs 2-${MAX_CHOICES} choices`);
        if (!l.choices.some((c) => c.stars > 0)) throw new Error(`${where}: ${l.id} needs a good choice`);
        if (l.tap && l.choices.some((c) => typeof c.target !== 'string' || !c.target)) throw new Error(`${where}: every answer to tap choice ${l.id} needs a target`);
        for (const c of l.choices) {
          if (typeof c.text !== 'string' || !Number.isInteger(c.stars) || c.stars < 0 || c.stars > 3) throw new Error(`${where}: ${l.id} has a bad choice`);
          if (!branches[c.next]) throw new Error(`${where}: ${l.id} goes to a missing branch "${c.next}"`);
        }
        ids.add(l.id);
        choiceIds.add(l.id);
      }
    });
    for (const [name, lines] of Object.entries(branches)) {
      if (!Array.isArray(lines) || lines.length === 0) throw new Error(`${where}: branch "${name}" is empty`);
      lines.forEach((l, i) => {
        checkLine(l, `branch ${name} line ${i + 1}`);
        if (l.choices) throw new Error(`${where}: branch "${name}" can't hold a choice`);
        if (l.retry && (i !== lines.length - 1 || !ids.has(l.retry))) throw new Error(`${where}: branch "${name}" retries a choice that isn't in its scene`);
      });
      // A not-best answer is talked over, never acted out.
      if (lines[lines.length - 1].retry && lines.some((l) => l.stage?.length)) throw new Error(`${where}: retry branch "${name}" can't move anyone`);
    }
    scenes.push({ id: raw.id, kind: String(raw.kind ?? 'story'), lines: raw.lines, branches });
  }
  const starChoices = Array.isArray(d.starChoices) ? (d.starChoices as string[]) : [...choiceIds];
  for (const id of starChoices) if (!choiceIds.has(id)) throw new Error(`${where}: star choice "${id}" isn't in the script`);
  const max = Number((d.stars as { max?: unknown })?.max ?? starChoices.length);
  return { id: d.id, room: String(d.room ?? ''), location: String(d.location ?? ''), ageBand: String(d.ageBand ?? ''), topic: String(d.topic ?? ''), scenes, starChoices, maxStars: max };
}

/** Every room mark a scenario's stage cues and tap answers use (so a test can check them against the room file). */
export function stageMarks(sc: Scenario): string[] {
  const cast = new Set<string>(['player']);
  const marks = new Set<string>();
  const lines = sc.scenes.flatMap((s) => [...s.lines, ...Object.values(s.branches).flat()]);
  for (const l of lines)
    for (const c of l.stage ?? []) {
      if (c.who) cast.add(c.who);
      if (c.to) marks.add(c.to);
      for (const m of [...(c.via ?? []), ...(c.fit ?? [])]) marks.add(m);
    }
  // A tap answer on a person points at them; one on a place points at a mark.
  for (const l of lines) for (const ch of l.tap ? (l.choices ?? []) : []) if (ch.target && !cast.has(ch.target)) marks.add(ch.target);
  return [...marks].sort();
}

/** Where the player is in a scenario. Plain data, so it can be saved or sent. */
export interface ScenarioState {
  scene: number;
  line: number;
  /** The branch being read after a choice, or null for the scene's own lines. */
  branch: string | null;
  /** The line index of the choice that opened the branch. */
  choiceLine: number;
  /** Choice ids already answered at least once (later tries earn no star). */
  tried: string[];
  /** Stars earned at each star choice. */
  stars: Record<string, number>;
  done: boolean;
}

export function startScenario(): ScenarioState {
  return { scene: 0, line: 0, branch: null, choiceLine: 0, tried: [], stars: {}, done: false };
}

/** The line on screen now, or null when the scenario is over. */
export function currentLine(sc: Scenario, st: ScenarioState): ScenarioLine | null {
  if (st.done) return null;
  const scene = sc.scenes[st.scene];
  return st.branch ? scene.branches[st.branch][st.line] : scene.lines[st.line];
}

/** Moves past a line with no choices ("Next"). */
export function advance(sc: Scenario, st: ScenarioState): ScenarioState {
  const line = currentLine(sc, st);
  if (!line || line.choices) return st;
  const scene = sc.scenes[st.scene];
  if (st.branch) {
    if (line.retry) return { ...st, branch: null, line: scene.lines.findIndex((l) => l.id === line.retry) };
    if (st.line + 1 < scene.branches[st.branch].length) return { ...st, line: st.line + 1 };
    return nextMain(sc, { ...st, branch: null, line: st.choiceLine });
  }
  return nextMain(sc, st);
}

function nextMain(sc: Scenario, st: ScenarioState): ScenarioState {
  if (st.line + 1 < sc.scenes[st.scene].lines.length) return { ...st, line: st.line + 1 };
  if (st.scene + 1 < sc.scenes.length) return { ...st, scene: st.scene + 1, line: 0 };
  return { ...st, done: true };
}

/** Picks a choice button. Only the first try at a star choice counts for stars. */
export function choose(sc: Scenario, st: ScenarioState, index: number): ScenarioState {
  const line = currentLine(sc, st);
  const pick = line?.choices?.[index];
  if (!line || !pick || !line.id) return st;
  const first = !st.tried.includes(line.id);
  const stars = first && sc.starChoices.includes(line.id) ? { ...st.stars, [line.id]: pick.stars } : st.stars;
  return { ...st, branch: pick.next, line: 0, choiceLine: st.line, tried: first ? [...st.tried, line.id] : st.tried, stars };
}

export function scenarioStars(sc: Scenario, st: ScenarioState): number {
  return Math.min(sc.maxStars, Object.values(st.stars).reduce((a, b) => a + b, 0));
}

/** Fills in {player} and {grownup}. */
export function fillLine(text: string, vars: { player: string; grownup: string }): string {
  return text.replace(/\{player\}/g, vars.player).replace(/\{grownup\}/g, vars.grownup);
}

/** Street Smarts opens at this belt tier (from content), or always for a test link. */
export function streetSmartsOpen(tier: number, unlockTier: number, testLink = false): boolean {
  return testLink || tier >= unlockTier;
}
