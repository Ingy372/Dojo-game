// Small vector helpers. Only + - * / and sqrt are used, because those give the
// exact same results on every phone and on the server (needed for co-op later).

export interface Vec2 {
  x: number;
  y: number;
}

export function length(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

export function distance(a: Vec2, b: Vec2): number {
  return length(b.x - a.x, b.y - a.y);
}

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/** Rounds to a fixed number of decimals so inputs from any device are identical. */
export function quantize(v: number, steps = 1000): number {
  return Math.round(v * steps) / steps;
}
