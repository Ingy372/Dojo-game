// Street Smarts: short real-world story scenes (framework section 8). The script is a data
// file in content/street-smarts/. This file walks through it: lines, choices, gentle retries
// and stars. A choice that isn't the best one never shows danger and never costs anything;
// Sensei talks it over and the player tries again right away.

export interface ScenarioChoice {
  text: string;
  stars: number;
  next: string;
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
}

export interface ScenarioScene {
  id: string;
  kind: string;
  lines: ScenarioLine[];
  branches: Record<string, ScenarioLine[]>;
}

export interface Scenario {
  id: string;
  location: string;
  ageBand: string;
  topic: string;
  scenes: ScenarioScene[];
  /** The choice points that earn a star when the best answer is picked on the first try. */
  starChoices: string[];
  maxStars: number;
}

/** Most buttons one choice may show (the store script's helper choice has 5). */
export const MAX_CHOICES = 5;

/** Reads a scenario file and checks every link in it, so a typo can't strand a player. */
export function loadScenario(data: unknown): Scenario {
  const d = data as Record<string, unknown>;
  const where = `Street Smarts "${String(d?.id)}"`;
  if (!d || typeof d.id !== 'string' || !Array.isArray(d.scenes) || d.scenes.length === 0) throw new Error(`${where}: needs an id and scenes`);
  const checkLine = (l: ScenarioLine, at: string) => {
    if (!l || typeof l.speaker !== 'string' || typeof l.text !== 'string' || l.text.trim() === '') throw new Error(`${where}: ${at} needs a speaker and text`);
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
    }
    scenes.push({ id: raw.id, kind: String(raw.kind ?? 'story'), lines: raw.lines, branches });
  }
  const starChoices = Array.isArray(d.starChoices) ? (d.starChoices as string[]) : [...choiceIds];
  for (const id of starChoices) if (!choiceIds.has(id)) throw new Error(`${where}: star choice "${id}" isn't in the script`);
  const max = Number((d.stars as { max?: unknown })?.max ?? starChoices.length);
  return { id: d.id, location: String(d.location ?? ''), ageBand: String(d.ageBand ?? ''), topic: String(d.topic ?? ''), scenes, starChoices, maxStars: max };
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
