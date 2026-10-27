// Q-DOOR-LABELS: the ?room= test link. An unknown id still starts a random room (as before),
// but now says so in the console instead of failing silently.
import { beltRoomId, type Content } from '@dojo/sim';

/** The room ?room= asks for on this belt, and a console warning when no such room exists. */
export function testRoom(content: Content, param: string | null, tier: number): { id: string | undefined; warning: string | null } {
  if (!param) return { id: undefined, warning: null };
  const id = beltRoomId(content, param, tier);
  // ?room=training opens the training room from the Title screen, not a tower room.
  const known = param === 'training' || content.rooms.some((r) => r.id === id);
  return { id, warning: known ? null : `?room=${param}: no room has that id, so a random room starts instead.` };
}
