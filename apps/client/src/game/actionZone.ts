// The Action Zone dojo (A4-DOJO): its inside room, outside entrance and the town picture,
// read once from content/dojo/action-zone/.
import { loadInsideRoom, loadOutsideRoom, loadTown } from '@dojo/sim';
import insideJson from '../../../../content/dojo/action-zone/inside-room.json';
import outsideJson from '../../../../content/dojo/action-zone/outside-room.json';
import townJson from '../../../../content/dojo/action-zone/town.json';

export const INSIDE = loadInsideRoom(insideJson);
export const INSIDE_PACK = 'dojo-az-inside';

export const OUTSIDE = loadOutsideRoom(outsideJson);
export const OUTSIDE_PACK = 'dojo-az-outside';

export const TOWN = loadTown(townJson);
export const TOWN_PACK = 'dojo-az-town';
